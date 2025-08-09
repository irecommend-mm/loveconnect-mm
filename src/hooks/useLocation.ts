
import { useState, useEffect } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Try to get city name from reverse geocoding
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            setLocation({
              latitude,
              longitude,
              city: data.city || data.locality || 'Unknown',
              country: data.countryName || 'Unknown'
            });
          } catch (err) {
            // Fallback without city name
            setLocation({
              latitude,
              longitude,
              city: 'Unknown'
            });
          }
          
          setLoading(false);
        },
        (error) => {
          setError(error.message);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  }, []);

  return { location, loading, error };
};
