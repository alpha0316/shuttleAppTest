import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = 'wss://shuttle-backend-0.onrender.com';

export const useShuttleSocket = () => {
  const [shuttles, setShuttles] = useState<any[]>([])
  
  useEffect(() => {
    // Initialize socket connection
    const socket: Socket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });

    // When socket connects
    socket.on('connect', () => {
      console.log('✅ Connected to server with ID:', socket.id);

      const userData = {
        name: "Test User",
        busStopId: "BUS-STOP-001",
        busStopName: "Main Campus Stop",
      };

      console.log("🚏 Connecting as user at bus stop:", userData);
      socket.emit("user-connect", userData);
    });

    socket.on("user-connected", (response) => {
      console.log("✅ Received response after user-connect:", response);
    });


    // Listen for shuttle location updates
    // Store shuttle locations in state
    // You can lift this state up or use a context for global access
    // For now, let's use a callback or setter passed as an argument (see below for usage)
    socket.on("shuttle-locations", (shuttles) => {
      shuttles.forEach((shuttle: { shuttleId: any; name: any; location: any; route: any; }) => {
      // console.log(`  Location: ${JSON.stringify(shuttle.location)}`);
      });
      // If you have a setter, call it here
      if (typeof setShuttles === "function") {
        setShuttles(shuttles);
      }
    });

    // Optional: disconnect and error handlers
    socket.on('disconnect', () => console.log('❌ Disconnected from server'));
    socket.on('error', (error) => console.error('⚠️ Socket error:', error.message));

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      socket.disconnect();
    };
  }, []);

  return shuttles
};
