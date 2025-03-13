import { useState, useEffect } from 'react';

interface Coordinates {
  lat: number | string;
  lng: number | string;
}

interface LocationState {
  loaded: boolean;
  coordinates: Coordinates;
}

interface GeolocationError {
  code: number;
  message: string;
}

const useGeolocation = () => {
  const [location, setLocation] = useState<LocationState>({
    loaded: false,
    coordinates: { lat: '', lng: '' },
  });
  const [error, setError] = useState<GeolocationError | null>(null);

  const onSuccess = (position: GeolocationPosition) => {
    setLocation({
      loaded: true,
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
    });
  };

  const onError = (error: GeolocationPositionError) => {
    console.error('Geolocation error:', error);
    setError({
      code: error.code,
      message: error.message,
    });
    setLocation((prev) => ({ ...prev, loaded: true }));
  };

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      onError({
        code: 0,
        message: 'Geolocation not supported',
      } as GeolocationPositionError);
      return;
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }, []);

  return { ...location, error };
};

export default useGeolocation;