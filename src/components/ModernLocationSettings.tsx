
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ModernLocationSettingsProps {
  open: boolean;
  onClose: () => void;
}

export const ModernLocationSettings = ({ open, onClose }: ModernLocationSettingsProps) => {
  const { user } = useAuth();
  const { location, loading: locationLoading, error: locationError } = useGeolocation();
  const [updating, setUpdating] = useState(false);
  const [showDistance, setShowDistance] = useState(true);
  const [incognito, setIncognito] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');

  useEffect(() => {
    if (user && open) {
      loadLocationSettings();
    }
  }, [user, open]);

  const loadLocationSettings = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('location, preferences')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentLocation(profile.location || '');
        const prefs = profile.preferences as { showDistance?: boolean; incognito?: boolean } | null;
        setShowDistance(prefs?.showDistance ?? true);
        setIncognito(prefs?.incognito ?? false);
      }
    } catch (error) {
      console.error('Error loading location settings:', error);
    }
  };

  const updateCurrentLocation = async () => {
    if (!user || !location) return;

    setUpdating(true);
    try {
      // Use reverse geocoding to get a more readable location
      const locationString = `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          location: locationString,
          latitude: location.lat,
          longitude: location.lng,
          last_active: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentLocation(locationString);
      
      toast({
        title: "Location Updated ✅",
        description: "Your current location has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Unable to update location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateLocationPreferences = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: {
            showDistance,
            incognito
          }
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Preferences Updated ✅",
        description: "Your location preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Unable to update preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-white to-gray-50">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span>Location Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Location Card */}
          <Card className="border-2 border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <Label className="text-base font-semibold text-gray-800 mb-3 block">
                Current Location
              </Label>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700 font-medium">
                    {currentLocation || 'Location not set'}
                  </span>
                </div>
              </div>
              
              {locationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600">
                    ⚠️ {locationError}
                  </p>
                </div>
              )}
              
              <Button
                onClick={updateCurrentLocation}
                disabled={locationLoading || updating || !location}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : locationLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Update Current Location
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Settings Card */}
          <Card className="border-2 border-gray-100 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <Label className="text-base font-semibold text-gray-800 block">
                Privacy Settings
              </Label>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Eye className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <Label htmlFor="showDistance" className="text-sm font-medium text-gray-800">
                        Show Distance
                      </Label>
                      <p className="text-xs text-gray-500">Let others see how far away you are</p>
                    </div>
                  </div>
                  <Switch
                    id="showDistance"
                    checked={showDistance}
                    onCheckedChange={setShowDistance}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <EyeOff className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <Label htmlFor="incognito" className="text-sm font-medium text-gray-800">
                        Incognito Mode
                      </Label>
                      <p className="text-xs text-gray-500">Browse privately without being seen</p>
                    </div>
                  </div>
                  <Switch
                    id="incognito"
                    checked={incognito}
                    onCheckedChange={setIncognito}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-2 border-gray-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={updateLocationPreferences} 
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
