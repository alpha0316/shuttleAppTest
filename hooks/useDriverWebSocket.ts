import { useEffect, useRef, useState, useCallback } from "react";

interface DriverLocation {
    id: string;
    location: {
        latitude: number;
        longitude: number;
    };
    timestamp: number;
}

interface WebSocketMessage {
    event: 'driver-locations' | 'share-location';
    data: DriverLocation[] | { latitude: number; longitude: number };
}

interface WebSocketHook {
    driverLocations: Record<string, DriverLocation>;
    shareLocation: (location: { latitude: number; longitude: number }) => void;
    isConnected: boolean;
    error: string | null;
}

export function useDriverWebSocket(url: string): WebSocketHook {
    const [driverLocations, setDriverLocations] = useState<Record<string, DriverLocation>>({});
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const connectWebSocket = useCallback(() => {
        console.log(`Attempting to connect to WebSocket at ${url}`);
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            setError(null);
            reconnectAttempts.current = 0;
            console.log('WebSocket Connected');
        };

        ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                if (message.event === 'driver-locations') {
                    const locations = message.data as DriverLocation[];
                    setDriverLocations((prev) => {
                        const updatedLocations: Record<string, DriverLocation> = { ...prev };
                        locations.forEach((loc) => {
                            updatedLocations[loc.id] = loc;
                        });
                        return updatedLocations;
                    });
                }
            } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
                setError('Invalid message format received');
            }
        };

        ws.onerror = (errorEvent) => {
            setError('WebSocket connection error');
            console.error('WebSocket error details:', errorEvent);
            if (errorEvent instanceof ErrorEvent) {
                console.error('Error message:', errorEvent.message);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            console.log('WebSocket disconnected');
            if (reconnectAttempts.current < maxReconnectAttempts) {
                const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 10000);
                setTimeout(() => {
                    reconnectAttempts.current += 1;
                    console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`);
                    connectWebSocket();
                }, delay);
            } else {
                setError('Max reconnection attempts reached');
            }
        };

        return ws;
    }, [url]);

    const shareLocation = useCallback((location: { latitude: number; longitude: number }) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message: WebSocketMessage = {
                event: 'share-location',
                data: location,
            };
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, cannot share location');
        }
    }, []);

    useEffect(() => {
        const ws = connectWebSocket();
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [connectWebSocket]);

    return {
        driverLocations,
        shareLocation,
        isConnected,
        error,
    };
}