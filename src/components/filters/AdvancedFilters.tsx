import React, { useState } from 'react';
import { X, Sliders, MapPin, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UserFilters } from '@/types/FriendDateTypes';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: UserFilters) => void;
  currentFilters: UserFilters;
}

export const AdvancedFilters = ({ isOpen, onClose, onApply, currentFilters }: AdvancedFiltersProps) => {
  const [ageRange, setAgeRange] = useState<[number, number]>(currentFilters.ageRange);
  const [maxDistance, setMaxDistance] = useState(currentFilters.maxDistance);
  const [relationshipType, setRelationshipType] = useState(currentFilters.relationshipType || '');
  const [showMe, setShowMe] = useState<'men' | 'women' | 'everyone'>(currentFilters.showMe);
  const [verified, setVerified] = useState(currentFilters.verifiedOnly || false);
  const [hasPhotos, setHasPhotos] = useState(currentFilters.hasPhotos || false);
  const [recentlyActive, setRecentlyActive] = useState(currentFilters.onlineOnly || false);

  const handleApply = () => {
    const filters: UserFilters = {
      ageRange,
      maxDistance,
      relationshipType: relationshipType as 'serious' | 'casual' | 'friends' | 'unsure' | undefined,
      showMe,
      interests: currentFilters.interests,
      verifiedOnly: verified,
      onlineOnly: recentlyActive,
      hasPhotos,
      hasBio: true,
    };
    onApply(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center space-x-2">
            <Sliders className="h-5 w-5" />
            <span>Advanced Filters</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Age Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Age Range</Label>
            <div className="px-2">
              <Slider
                value={ageRange}
                onValueChange={(value) => setAgeRange([value[0], value[1]])}
                max={100}
                min={18}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{ageRange[0]}</span>
                <span>{ageRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Distance (km)</span>
            </Label>
            <div className="px-2">
              <Slider
                value={[maxDistance]}
                onValueChange={(value) => setMaxDistance(value[0])}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-center text-xs text-muted-foreground mt-1">
                <span>{maxDistance} km</span>
              </div>
            </div>
          </div>

          {/* Show Me */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Show Me</span>
            </Label>
            <Select value={showMe} onValueChange={(value: 'men' | 'women' | 'everyone') => setShowMe(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Relationship Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Looking For</span>
            </Label>
            <Select value={relationshipType} onValueChange={setRelationshipType}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="serious">Serious Relationship</SelectItem>
                <SelectItem value="casual">Casual Dating</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="unsure">Not Sure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Filters */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Additional Filters</Label>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm">Verified profiles only</Label>
              <Switch checked={verified} onCheckedChange={setVerified} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Must have photos</Label>
              <Switch checked={hasPhotos} onCheckedChange={setHasPhotos} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Recently active</Label>
              <Switch checked={recentlyActive} onCheckedChange={setRecentlyActive} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};