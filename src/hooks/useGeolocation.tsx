
import { useState, useEffect, useCallback } from 'react';

interface GeolocationCoordinates {
  lat: number;
  lng: number;
}

interface GeolocationState {
  location: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  });

  const getCurrentLocation = useCallback((): Promise<GeolocationCoordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          setState({
            location: coordinates,
            loading: false,
            error: null,
          });
          
          resolve(coordinates);
        },
        (error) => {
          let errorMessage = 'Unable to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }

          setState({
            location: null,
            loading: false,
            error: errorMessage,
          });
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, []);

  // Auto-get location on mount
  useEffect(() => {
    getCurrentLocation().catch(() => {
      // Silently handle errors on auto-fetch
    });
  }, [getCurrentLocation]);

  return {
    ...state,
    getCurrentLocation,
  };
};
