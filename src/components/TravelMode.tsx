
import React, { useState, useEffect } from 'react';
import { MapPin, Plane, X, Search, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TravelModeProps {
  onClose: () => void;
}

interface TravelDestination {
  id: string;
  city: string;
  country: string;
  userCount: number;
  isPopular: boolean;
}

const TravelMode = ({ onClose }: TravelModeProps) => {
  const { user } = useAuth();
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedDates, setSelectedDates] = useState({ start: '', end: '' });
  const [travelDestinations, setTravelDestinations] = useState<TravelDestination[]>([
    { id: '1', city: 'New York', country: 'USA', userCount: 1250, isPopular: true },
    { id: '2', city: 'Paris', country: 'France', userCount: 890, isPopular: true },
    { id: '3', city: 'Tokyo', country: 'Japan', userCount: 675, isPopular: false },
    { id: '4', city: 'London', country: 'UK', userCount: 1100, isPopular: true },
    { id: '5', city: 'Barcelona', country: 'Spain', userCount: 540, isPopular: false },
    { id: '6', city: 'Amsterdam', country: 'Netherlands', userCount: 420, isPopular: false },
  ]);

  const handleTravelPlanCreate = async () => {
    if (!user || !searchLocation || !selectedDates.start || !selectedDates.end) return;

    try {
      // In a real app, you would save this to a travel_plans table
      console.log('Creating travel plan:', {
        userId: user.id,
        destination: searchLocation,
        startDate: selectedDates.start,
        endDate: selectedDates.end
      });
      
      // Show success message
      alert(`Travel plan created for ${searchLocation}! You'll now see people in that area.`);
      onClose();
    } catch (error) {
      console.error('Error creating travel plan:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
              Travel Mode
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create Travel Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span>Plan Your Trip</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where are you traveling?
                </label>
                <div className="relative">
                  <Input
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Enter city or destination"
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={selectedDates.start}
                    onChange={(e) => setSelectedDates({...selectedDates, start: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={selectedDates.end}
                    onChange={(e) => setSelectedDates({...selectedDates, end: e.target.value})}
                  />
                </div>
              </div>

              <Button
                onClick={handleTravelPlanCreate}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                disabled={!searchLocation || !selectedDates.start || !selectedDates.end}
              >
                <Plane className="h-4 w-4 mr-2" />
                Start Matching in {searchLocation || 'This City'}
              </Button>
            </CardContent>
          </Card>

          {/* Popular Destinations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Popular Destinations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {travelDestinations.map((destination) => (
                <Card key={destination.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{destination.city}</h4>
                        <p className="text-sm text-gray-600">{destination.country}</p>
                      </div>
                      {destination.isPopular && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {destination.userCount.toLocaleString()} active users
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSearchLocation(`${destination.city}, ${destination.country}`)}
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Travel Tips */}
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Travel Mode Benefits</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Connect with locals and fellow travelers
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Get recommendations for places to visit
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Find companions for activities and adventures
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Make meaningful connections while traveling
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TravelMode;
