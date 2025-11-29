import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = 'https://shuttle-backend-0.onrender.com';

interface ShuttleLocation {
  id: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp?: number;
  driverID?: string;
  busRoute?: any;
  driverInfo?: any;
}

interface BusStopUser {
  id: string;
  busStopId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface UseShuttleSocketOptions {
  busStopId?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  autoConnect?: boolean;
  debug?: boolean;
}

interface UseShuttleSocketReturn {
  shuttles: ShuttleLocation[];
  busStopUsers: BusStopUser[];
  isConnected: boolean;
  socketId?: string;
  connectionError: string | null;
  updateBusStop: (busStopId: string) => void;
  updateUserLocation: (latitude: number, longitude: number) => void;
  connectAsUser: (busStopId: string, latitude: number, longitude: number) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useShuttleSocket = (
  options: UseShuttleSocketOptions = {}
): UseShuttleSocketReturn => {
  const { busStopId, userLocation, autoConnect = true, debug = true } = options;

  const [shuttles, setShuttles] = useState<ShuttleLocation[]>([]);
  const [busStopUsers, setBusStopUsers] = useState<BusStopUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string>();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  const log = useCallback((message: string, data?: any) => {
    if (debug) {
      console.log(`🔌 [ShuttleSocket] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }, [debug]);

  const initializeSocket = useCallback(() => {
    log('Initializing socket connection...');
    
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Initialize socket connection
    const socket: Socket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['polling', 'websocket'],
      forceNew: false,
      upgrade: true,
      rememberUpgrade: true,
      rejectUnauthorized: false,
      withCredentials: false,
    });

    socketRef.current = socket;
    setConnectionError(null);

    // Connection event handler
    socket.on('connect', () => {
      const id = socket.id;
      setSocketId(id);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttemptsRef.current = 0;
      log('✅ Connected to server', { 
        socketId: id, 
        connected: socket.connected,
        transport: socket.io.engine.transport.name 
      });

      // Auto-connect as user if bus stop and location provided
      if (busStopId && userLocation) {
        const userData = {
          busStopId: busStopId,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        };

        log('🚏 Auto-connecting as user at bus stop', userData);
        socket.emit('user-connect', userData);
      }
    });

    // Listen for all events for debugging
    socket.onAny((eventName, ...args) => {
      log(`📨 Received event: ${eventName}`, args);
    });

    socket.onAnyOutgoing((eventName, ...args) => {
      log(`📤 Sent event: ${eventName}`, args);
    });

    // Listen for shuttle location updates - CRITICAL HANDLER
    socket.on('shuttle-locations', (data: any) => {
      log('🚌 Raw shuttle locations data received', data);
      
      try {
        // Handle different data formats from backend
        let shuttleArray: ShuttleLocation[] = [];
        
        if (Array.isArray(data)) {
          // Backend sent array of shuttles
          shuttleArray = data.map((shuttle: any) => ({
            id: shuttle.id || shuttle.driverID || shuttle.shuttleId || Math.random().toString(),
            latitude: shuttle.latitude || shuttle.location?.latitude || 0,
            longitude: shuttle.longitude || shuttle.location?.longitude || 0,
            heading: shuttle.heading || shuttle.location?.heading || 0,
            speed: shuttle.speed || shuttle.location?.speed || 0,
            timestamp: shuttle.timestamp || Date.now(),
            driverID: shuttle.driverID || shuttle.id,
            busRoute: shuttle.busRoute,
            driverInfo: shuttle.driverInfo,
          }));
        } else if (data && typeof data === 'object') {
          // Backend sent single shuttle object
          shuttleArray = [{
            id: data.id || data.driverID || data.shuttleId || Math.random().toString(),
            latitude: data.latitude || data.location?.latitude || 0,
            longitude: data.longitude || data.location?.longitude || 0,
            heading: data.heading || data.location?.heading || 0,
            speed: data.speed || data.location?.speed || 0,
            timestamp: data.timestamp || Date.now(),
            driverID: data.driverID || data.id,
            busRoute: data.busRoute,
            driverInfo: data.driverInfo,
          }];
        } else if (data && typeof data === 'string') {
          // Backend might have sent JSON string
          try {
            const parsed = JSON.parse(data);
            socket.emit('shuttle-locations', parsed); // Re-emit to trigger handler
            return;
          } catch (e) {
            console.error('Failed to parse shuttle data:', e);
            return;
          }
        }

        log('🚌 Processed shuttle data', shuttleArray);

        // Update state
        if (shuttleArray.length === 1) {
          // Single shuttle update - merge with existing
          setShuttles(prev => {
            const shuttle = shuttleArray[0];
            const existingIndex = prev.findIndex(s => s.id === shuttle.id);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = shuttle;
              return updated;
            } else {
              return [...prev, shuttle];
            }
          });
        } else {
          // Multiple shuttles - replace all
          setShuttles(shuttleArray);
        }
      } catch (error) {
        console.error('Error processing shuttle locations:', error);
        log('❌ Error processing data', error);
      }
    });

    // Listen for bus stop updates
    socket.on('bus-stop-updates', (data: any) => {
      log('🚏 Raw bus stop updates received', data);
      
      try {
        let usersArray: BusStopUser[] = [];
        
        if (Array.isArray(data)) {
          usersArray = data.map((user: any) => ({
            id: user.id || user.userId || Math.random().toString(),
            busStopId: user.busStopId || '',
            latitude: user.latitude || 0,
            longitude: user.longitude || 0,
            timestamp: user.timestamp || Date.now(),
          }));
        } else if (data && typeof data === 'object') {
          usersArray = [{
            id: data.id || data.userId || Math.random().toString(),
            busStopId: data.busStopId || '',
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            timestamp: data.timestamp || Date.now(),
          }];
        }

        log('🚏 Processed bus stop data', usersArray);

        if (usersArray.length === 1) {
          setBusStopUsers(prev => {
            const user = usersArray[0];
            const existingIndex = prev.findIndex(u => u.id === user.id);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = user;
              return updated;
            } else {
              return [...prev, user];
            }
          });
        } else {
          setBusStopUsers(usersArray);
        }
      } catch (error) {
        console.error('Error processing bus stop updates:', error);
      }
    });

    // Listen for shuttle status updates
    socket.on('shuttle-status-update', (data: any) => {
      log('🔄 Shuttle status update', data);
      // This could indicate a driver connected/disconnected
      // You might want to refresh the shuttles list
    });

    // Connection error handler
    socket.on('connect_error', (error: any) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
      setConnectionError(error.message);
      
      reconnectAttemptsRef.current++;
      
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        log(`🔄 Max reconnection attempts (${maxReconnectAttempts}) reached`);
        setConnectionError(`Failed to connect after ${maxReconnectAttempts} attempts. Please check your internet connection.`);
      }
    });

    socket.on('connection-error', (error: any) => {
      console.error('⚠️ Server connection error:', error);
      setConnectionError(error.message || 'Server connection error');
    });

    // Disconnect handler
    socket.on('disconnect', (reason: string) => {
      log('❌ Disconnected', { reason });
      setIsConnected(false);
      setSocketId(undefined);
      
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    // Reconnection handlers
    socket.on('reconnect', (attemptNumber: number) => {
      log('🔄 Reconnected', { attemptNumber });
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('reconnect_error', (error: any) => {
      console.error('⚠️ Reconnection error:', error);
      setConnectionError(`Reconnection failed: ${error.message}`);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed permanently');
      setIsConnected(false);
      setConnectionError('Reconnection failed. Please refresh.');
    });

    return socket;
  }, [busStopId, userLocation, log]);

  useEffect(() => {
    if (!autoConnect) return;


    return () => {
      log('🧹 Cleaning up socket');
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [autoConnect, initializeSocket, log]);

  const reconnect = useCallback(() => {
    log('🔄 Manual reconnection');
    setConnectionError(null);
    reconnectAttemptsRef.current = 0;
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    } else {
      initializeSocket();
    }
  }, [initializeSocket, log]);

  const connectAsUser = useCallback(
    (busStopId: string, latitude: number, longitude: number) => {
      if (socketRef.current && isConnected) {
        const userData = { busStopId, latitude, longitude };
        log('🚏 Connecting as user', userData);
        socketRef.current.emit('user-connect', userData);
      } else {
        console.warn('⚠️ Not connected');
        setConnectionError('Not connected to server');
        if (socketRef.current && !isConnected) {
          reconnect();
        }
      }
    },
    [isConnected, reconnect, log]
  );

  const updateBusStop = useCallback(
    (newBusStopId: string) => {
      if (socketRef.current && isConnected) {
        log('🔄 Updating bus stop', { newBusStopId });
        socketRef.current.emit('user-bus-stop-update', { busStopId: newBusStopId });
      } else {
        console.warn('⚠️ Not connected');
        setConnectionError('Not connected to server');
      }
    },
    [isConnected, log]
  );

  const updateUserLocation = useCallback(
    (latitude: number, longitude: number) => {
      if (socketRef.current && isConnected) {
        log('📍 Updating location', { latitude, longitude });
        socketRef.current.emit('user-location-update', { latitude, longitude });
      } else {
        console.warn('⚠️ Not connected');
        setConnectionError('Not connected to server');
      }
    },
    [isConnected, log]
  );

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      log('🔌 Disconnecting');
      socketRef.current.disconnect();
      setIsConnected(false);
      setSocketId(undefined);
    }
  }, [log]);

  return {
    shuttles,
    busStopUsers,
    isConnected,
    socketId,
    connectionError,
    updateBusStop,
    updateUserLocation,
    connectAsUser,
    disconnect,
    reconnect,
  };
};