import { useState, useEffect } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState({
    loaded: false,
    coordinates: { lat: '', lng: '' },
  });
  const [error, setError] = useState(null);

  const onSuccess = (position) => {
    setLocation({
      loaded: true,
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
    });
  };

  const onError = (error) => {
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
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }, []);

  return { ...location, error };
};

export default useGeolocation;