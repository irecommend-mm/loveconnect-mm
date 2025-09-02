
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, Eye, EyeOff } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface LocationSettingsProps {
  open: boolean;
  onClose: () => void;
}

export const LocationSettings = ({ open, onClose }: LocationSettingsProps) => {
  const { user } = useAuth();
  const { location, loading: locationLoading } = useGeolocation();
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
      // Reverse geocoding to get address (simplified)
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
        title: "Location Updated",
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
        title: "Preferences Updated",
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Location Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Location */}
          <div>
            <Label className="text-base font-semibold">Current Location</Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {currentLocation || 'Location not set'}
                </span>
              </div>
            </div>
            
            <Button
              onClick={updateCurrentLocation}
              disabled={locationLoading || updating || !location}
              className="w-full mt-2"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {updating ? 'Updating...' : 'Update Current Location'}
            </Button>
            
            {locationLoading && (
              <p className="text-sm text-gray-500 mt-1">Getting your location...</p>
            )}
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Privacy Settings</Label>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <div>
                  <Label htmlFor="showDistance" className="text-sm font-medium">Show Distance</Label>
                  <p className="text-xs text-gray-500">Let others see how far away you are</p>
                </div>
              </div>
              <Switch
                id="showDistance"
                checked={showDistance}
                onCheckedChange={setShowDistance}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <EyeOff className="h-4 w-4 text-gray-500" />
                <div>
                  <Label htmlFor="incognito" className="text-sm font-medium">Incognito Mode</Label>
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

          {/* Save Button */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={updateLocationPreferences} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
