
import React, { useState } from 'react';
import { X, Sliders, MapPin, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppMode, UserFilters } from '@/types/FriendDateTypes';

interface AdvancedFiltersProps {
  currentMode: AppMode;
  onClose: () => void;
  onApplyFilters: (filters: UserFilters) => void;
}

const AdvancedFilters = ({ currentMode, onClose, onApplyFilters }: AdvancedFiltersProps) => {
  const [ageRange, setAgeRange] = useState([22, 35]);
  const [distance, setDistance] = useState([25]);
  const [relationshipType, setRelationshipType] = useState('any');
  const [showMe, setShowMe] = useState('everyone');
  const [height, setHeight] = useState('any');
  const [education, setEducation] = useState('any');
  const [smoking, setSmoking] = useState('any');
  const [drinking, setDrinking] = useState('any');
  const [exercise, setExercise] = useState('any');
  const [verified, setVerified] = useState(false);
  const [hasPhotos, setHasPhotos] = useState(true);
  const [recentlyActive, setRecentlyActive] = useState(false);

  const handleApplyFilters = () => {
    const filters: UserFilters = {
      ageRange: [ageRange[0], ageRange[1]],
      maxDistance: distance[0],
      showMe: showMe as 'men' | 'women' | 'everyone',
      relationshipType: relationshipType === 'any' ? undefined : relationshipType as 'serious' | 'casual' | 'friends' | 'unsure',
      verifiedOnly: verified,
      hasPhotos,
      onlineOnly: recentlyActive,
    };
    onApplyFilters(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Sliders className="h-5 w-5 mr-2 text-purple-600" />
              Advanced Filters
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {currentMode === 'friend' ? (
              <>
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-blue-600 font-medium">Friend Mode</span>
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 text-pink-500" />
                <span className="text-pink-600 font-medium">Date Mode</span>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Age Range */}
          <div>
            <label className="text-sm font-medium block mb-3">
              Age Range: {ageRange[0]} - {ageRange[1]} years
            </label>
            <Slider
              value={ageRange}
              onValueChange={setAgeRange}
              max={65}
              min={18}
              step={1}
              className="w-full"
            />
          </div>

          {/* Distance */}
          <div>
            <label className="text-sm font-medium block mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Maximum Distance: {distance[0]} km
            </label>
            <Slider
              value={distance}
              onValueChange={setDistance}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Show Me */}
          <div>
            <label className="text-sm font-medium block mb-2">Show Me</label>
            <Select value={showMe} onValueChange={setShowMe}>
              <SelectTrigger>
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Relationship Type */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {currentMode === 'friend' ? 'Looking For' : 'Relationship Type'}
            </label>
            <Select value={relationshipType} onValueChange={setRelationshipType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {currentMode === 'friend' ? (
                  <>
                    <SelectItem value="friends">New Friends</SelectItem>
                    <SelectItem value="activity">Activity Partner</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="serious">Serious Relationship</SelectItem>
                    <SelectItem value="casual">Casual Dating</SelectItem>
                    <SelectItem value="unsure">Not Sure Yet</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Additional Options</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Verified profiles only</span>
              <Switch checked={verified} onCheckedChange={setVerified} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Has photos</span>
              <Switch checked={hasPhotos} onCheckedChange={setHasPhotos} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Recently active</span>
              <Switch checked={recentlyActive} onCheckedChange={setRecentlyActive} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleApplyFilters} 
              className={`flex-1 ${
                currentMode === 'friend' 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-pink-500 hover:bg-pink-600'
              }`}
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedFilters;
