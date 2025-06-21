
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Filter, MapPin, Heart, User, Eye, EyeOff } from 'lucide-react';

interface FilterSettings {
  ageRange: [number, number];
  maxDistance: number;
  showMe: 'men' | 'women' | 'everyone';
  relationshipType: 'serious' | 'casual' | 'friends' | 'unsure' | 'any';
  verifiedOnly: boolean;
  showAge: boolean;
  showDistance: boolean;
  incognitoMode: boolean;
  onlineOnly: boolean;
  hasPhotos: boolean;
  education: string[];
  interests: string[];
}

interface AdvancedFiltersProps {
  onClose: () => void;
  onApply: (filters: FilterSettings) => void;
  initialFilters?: Partial<FilterSettings>;
}

const AdvancedFilters = ({ onClose, onApply, initialFilters }: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<FilterSettings>({
    ageRange: [22, 35],
    maxDistance: 25,
    showMe: 'everyone',
    relationshipType: 'any',
    verifiedOnly: false,
    showAge: true,
    showDistance: true,
    incognitoMode: false,
    onlineOnly: false,
    hasPhotos: true,
    education: [],
    interests: [],
    ...initialFilters
  });

  const educationOptions = [
    'High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree', 
    'PhD', 'Trade School', 'Professional Degree'
  ];

  const interestOptions = [
    'Travel', 'Photography', 'Hiking', 'Cooking', 'Music', 'Art', 'Fitness',
    'Reading', 'Movies', 'Dancing', 'Yoga', 'Gaming', 'Wine', 'Coffee'
  ];

  const updateFilters = (updates: Partial<FilterSettings>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const toggleEducation = (education: string) => {
    setFilters(prev => ({
      ...prev,
      education: prev.education.includes(education)
        ? prev.education.filter(e => e !== education)
        : [...prev.education, education]
    }));
  };

  const toggleInterest = (interest: string) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const resetFilters = () => {
    setFilters({
      ageRange: [18, 50],
      maxDistance: 50,
      showMe: 'everyone',
      relationshipType: 'any',
      verifiedOnly: false,
      showAge: true,
      showDistance: true,
      incognitoMode: false,
      onlineOnly: false,
      hasPhotos: true,
      education: [],
      interests: []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center space-x-2">
            <Filter className="h-6 w-6 text-pink-500" />
            <span>Advanced Filters</span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Preferences */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Basic Preferences</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
                </label>
                <Slider
                  value={filters.ageRange}
                  onValueChange={(value) => updateFilters({ ageRange: value as [number, number] })}
                  min={18}
                  max={65}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Maximum Distance: {filters.maxDistance} km
                </label>
                <Slider
                  value={[filters.maxDistance]}
                  onValueChange={(value) => updateFilters({ maxDistance: value[0] })}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Show me</label>
                <div className="space-y-2">
                  {[
                    { value: 'men', label: 'Men' },
                    { value: 'women', label: 'Women' },
                    { value: 'everyone', label: 'Everyone' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value={option.value}
                        checked={filters.showMe === option.value}
                        onChange={(e) => updateFilters({ showMe: e.target.value as any })}
                        className="text-pink-600"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
                <div className="space-y-2">
                  {[
                    { value: 'any', label: 'Any' },
                    { value: 'serious', label: 'Something serious' },
                    { value: 'casual', label: 'Something casual' },
                    { value: 'friends', label: 'New friends' },
                    { value: 'unsure', label: "I'm not sure yet" }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value={option.value}
                        checked={filters.relationshipType === option.value}
                        onChange={(e) => updateFilters({ relationshipType: e.target.value as any })}
                        className="text-pink-600"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Privacy & Display Settings */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Privacy & Display</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <EyeOff className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Incognito Mode</p>
                    <p className="text-sm text-gray-500">Only people you like can see you</p>
                  </div>
                </div>
                <Switch
                  checked={filters.incognitoMode}
                  onCheckedChange={(checked) => updateFilters({ incognitoMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Show my age</p>
                    <p className="text-sm text-gray-500">Display age on your profile</p>
                  </div>
                </div>
                <Switch
                  checked={filters.showAge}
                  onCheckedChange={(checked) => updateFilters({ showAge: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Show distance</p>
                    <p className="text-sm text-gray-500">Display distance on profiles</p>
                  </div>
                </div>
                <Switch
                  checked={filters.showDistance}
                  onCheckedChange={(checked) => updateFilters({ showDistance: checked })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Advanced Filters */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Advanced Filters</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Verified profiles only</span>
                <Switch
                  checked={filters.verifiedOnly}
                  onCheckedChange={(checked) => updateFilters({ verifiedOnly: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Online now</span>
                <Switch
                  checked={filters.onlineOnly}
                  onCheckedChange={(checked) => updateFilters({ onlineOnly: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Must have photos</span>
                <Switch
                  checked={filters.hasPhotos}
                  onCheckedChange={(checked) => updateFilters({ hasPhotos: checked })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Education */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Education</h3>
            <div className="flex flex-wrap gap-2">
              {educationOptions.map(education => (
                <Badge
                  key={education}
                  variant={filters.education.includes(education) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    filters.education.includes(education)
                      ? 'bg-pink-500 hover:bg-pink-600'
                      : 'hover:bg-pink-50'
                  }`}
                  onClick={() => toggleEducation(education)}
                >
                  {education}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Interests */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(interest => (
                <Badge
                  key={interest}
                  variant={filters.interests.includes(interest) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    filters.interests.includes(interest)
                      ? 'bg-pink-500 hover:bg-pink-600'
                      : 'hover:bg-pink-50'
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex space-x-3">
          <Button
            onClick={resetFilters}
            variant="outline"
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
