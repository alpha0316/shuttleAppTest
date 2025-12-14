// MapboxLoader.tsx
import { useEffect, useState } from 'react';

const MAPBOX_VERSION = '2.15.0';

export const useMapboxLoader = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Mapbox is already loaded
    if (typeof window !== 'undefined') {
      if (window.mapboxgl && typeof window.mapboxgl.Map !== 'undefined') {
        setIsLoaded(true);
        return;
      }
    }

    // Load Mapbox GL JS dynamically
    const loadMapbox = async () => {
      try {
        // Load CSS
        const link = document.createElement('link');
        link.href = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.css`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.src = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.js`;
        script.async = true;
        
        script.onload = () => {
          if (window.mapboxgl) {
            // Set access token
            window.mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ||
              process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
              'pk.eyJ1IjoidGhlbG9jYWxnb2RkIiwiYSI6ImNtMm9ocHFhYTBmczQya3NnczhoampiZ3gifQ.lPNutwk6XRi_kH_1R1ebiw';
            setIsLoaded(true);
          }
        };

        script.onerror = () => {
          setError('Failed to load Mapbox GL JS');
        };

        document.head.appendChild(script);
      } catch (err) {
        setError('Error loading Mapbox: ' + (err as Error).message);
      }
    };

    loadMapbox();
  }, []);

  return { isLoaded, error };
};

// Component wrapper
export const MapboxLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, error } = useMapboxLoader();

  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h3>Map Loading Error</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '10px' }}>Loading map...</div>
        <div className="spinner"></div>
        <style>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
};