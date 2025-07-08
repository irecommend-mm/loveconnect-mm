
import React, { useState } from 'react';
import { MapPin, Globe, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PassportModeProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
  currentLocation?: string;
}

const PassportMode = ({ isOpen, onClose, onLocationChange, currentLocation }: PassportModeProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const popularCities = [
    { name: 'New York, NY', country: 'USA', coords: { lat: 40.7128, lng: -74.0060 } },
    { name: 'Los Angeles, CA', country: 'USA', coords: { lat: 34.0522, lng: -118.2437 } },
    { name: 'London, UK', country: 'UK', coords: { lat: 51.5074, lng: -0.1278 } },
    { name: 'Paris, France', country: 'France', coords: { lat: 48.8566, lng: 2.3522 } },
    { name: 'Tokyo, Japan', country: 'Japan', coords: { lat: 35.6762, lng: 139.6503 } },
    { name: 'Sydney, Australia', country: 'Australia', coords: { lat: -33.8688, lng: 151.2093 } },
    { name: 'Dubai, UAE', country: 'UAE', coords: { lat: 25.2048, lng: 55.2708 } },
    { name: 'Miami, FL', country: 'USA', coords: { lat: 25.7617, lng: -80.1918 } },
  ];

  const handleCitySelect = (city: typeof popularCities[0]) => {
    onLocationChange(city.name, city.coords);
    onClose();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      onLocationChange(searchQuery);
      setIsSearching(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Passport</h2>
              <p className="text-sm text-gray-500">Swipe around the world</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Current Location */}
          {currentLocation && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Location</h3>
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-xl">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">{currentLocation}</span>
                <Badge variant="secondary" className="ml-auto text-xs bg-green-100 text-green-700">
                  Active
                </Badge>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Search Location</h3>
            <div className="flex space-x-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter city or country..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Popular Cities */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Destinations</h3>
            <div className="grid grid-cols-1 gap-2">
              {popularCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city)}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {city.name.split(',')[0].slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{city.name}</p>
                      <p className="text-xs text-gray-500">{city.country}</p>
                    </div>
                  </div>
                  <MapPin className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassportMode;
