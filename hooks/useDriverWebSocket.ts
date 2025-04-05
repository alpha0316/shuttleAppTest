import { useEffect, useRef, useState, useCallback } from "react";

interface DriverLocation {
    id: string;
    location: {
        latitude: number;
        longitude: number;
    };
    timestamp: number;
}

interface WebSocketHook {
    driverLocations: DriverLocation[];
    shareLocation: (location: { latitude: number; longitude: number }) => void;
    isConnected: boolean;
    error: string | null;
}

export function useDriverWebSocket(url: string): WebSocketHook {
    const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const shareLocation = useCallback((location: { latitude: number; longitude: number }) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                event: 'share-location',
                data: location
            }));
        }
    }, []);

    useEffect(() => {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            setError(null);
            console.log('WebSocket Connected');
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.event === 'driver-location') {
                    setDriverLocations(message.data);
                }
            } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
            }
        };

        ws.onerror = (errorEvent) => {
            setError('WebSocket connection error');
            console.error('WebSocket error:', errorEvent);
        };

        ws.onclose = () => {
            setIsConnected(false);
            console.log('WebSocket disconnected');
        };

        return () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
        };
    }, [url]);

    return {
        driverLocations,
        shareLocation,
        isConnected,
        error
    };
}