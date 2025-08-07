
import React, { useState } from 'react';
import { X, Filter, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface FilterPreferences {
  ageRange: [number, number];
  maxDistance: number;
  relationshipType: string[];
  education: string[];
  occupation: string[];
  height: [number, number];
  exercise: string[];
  drinking: string[];
  smoking: string[];
  children: string[];
  religion: string[];
  zodiacSigns: string[];
  interests: string[];
  verified: boolean;
  recentlyActive: boolean;
  hasPhotos: boolean;
  completedProfile: boolean;
}

interface AdvancedFiltersProps {
  onClose: () => void;
  onApply: (filters: FilterPreferences) => void;
  isPremium?: boolean;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onClose,
  onApply,
  isPremium = false
}) => {
  const [filters, setFilters] = useState<FilterPreferences>({
    ageRange: [18, 35],
    maxDistance: 25,
    relationshipType: [],
    education: [],
    occupation: [],
    height: [150, 200],
    exercise: [],
    drinking: [],
    smoking: [],
    children: [],
    religion: [],
    zodiacSigns: [],
    interests: [],
    verified: false,
    recentlyActive: false,
    hasPhotos: true,
    completedProfile: false
  });

  const relationshipTypes = [
    'Serious Relationship', 'Casual Dating', 'Friendship', 'Not Sure'
  ];

  const educationLevels = [
    'High School', 'Some College', 'Bachelor\'s', 'Master\'s', 'PhD', 'Trade School'
  ];

  const occupationCategories = [
    'Technology', 'Healthcare', 'Education', 'Business', 'Arts', 'Finance',
    'Engineering', 'Law', 'Marketing', 'Sales', 'Student', 'Other'
  ];

  const exerciseOptions = [
    'Daily', 'Often', 'Sometimes', 'Never'
  ];

  const drinkingOptions = [
    'Never', 'Occasionally', 'Socially', 'Regularly'
  ];

  const smokingOptions = [
    'Never', 'Occasionally', 'Regularly'
  ];

  const childrenOptions = [
    'Have Kids', 'Want Kids', 'Don\'t Want Kids', 'Open to Kids'
  ];

  const religions = [
    'Christian', 'Catholic', 'Jewish', 'Muslim', 'Hindu', 'Buddhist',
    'Atheist', 'Agnostic', 'Spiritual', 'Other'
  ];

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const popularInterests = [
    'Travel', 'Photography', 'Music', 'Fitness', 'Cooking', 'Reading',
    'Movies', 'Art', 'Sports', 'Gaming', 'Dancing', 'Yoga', 'Hiking'
  ];

  const handleMultiSelect = (category: keyof FilterPreferences, value: string) => {
    setFilters(prev => {
      const currentValues = prev[category] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [category]: newValues
      };
    });
  };

  const handleApply = () => {
    onApply(filters);
  };

  const resetFilters = () => {
    setFilters({
      ageRange: [18, 35],
      maxDistance: 25,
      relationshipType: [],
      education: [],
      occupation: [],
      height: [150, 200],
      exercise: [],
      drinking: [],
      smoking: [],
      children: [],
      religion: [],
      zodiacSigns: [],
      interests: [],
      verified: false,
      recentlyActive: false,
      hasPhotos: true,
      completedProfile: false
    });
  };

  const PremiumFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={`relative ${!isPremium ? 'opacity-50' : ''}`}>
      {children}
      {!isPremium && (
        <div className="absolute inset-0 bg-gradient-to-t from-amber-100/80 to-transparent rounded-lg flex items-center justify-center">
          <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Premium
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh]">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="basic">Basic Filters</TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-1">
                Advanced
                <Crown className="h-3 w-3 text-amber-500" />
              </TabsTrigger>
            </TabsList>

            {/* Basic Filters Tab */}
            <TabsContent value="basic" className="p-4 space-y-6">
              {/* Age Range */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
                </label>
                <Slider
                  value={filters.ageRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
                  min={18}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Distance */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Maximum Distance: {filters.maxDistance} km
                </label>
                <Slider
                  value={[filters.maxDistance]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, maxDistance: value[0] }))}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Relationship Type */}
              <div>
                <label className="block text-sm font-semibold mb-3">Looking For</label>
                <div className="grid grid-cols-2 gap-2">
                  {relationshipTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleMultiSelect('relationshipType', type)}
                      className={`p-3 text-sm border rounded-lg transition-colors ${
                        filters.relationshipType.includes(type)
                          ? 'bg-pink-100 border-pink-300 text-pink-800'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Preferences */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Only show verified profiles</span>
                  <Switch
                    checked={filters.verified}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verified: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Recently active</span>
                  <Switch
                    checked={filters.recentlyActive}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, recentlyActive: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Has photos</span>
                  <Switch
                    checked={filters.hasPhotos}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasPhotos: checked }))}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Advanced Filters Tab */}
            <TabsContent value="advanced" className="p-4 space-y-6">
              <PremiumFeature>
                {/* Education */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Education Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {educationLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() => isPremium && handleMultiSelect('education', level)}
                        className={`p-2 text-xs border rounded-lg transition-colors ${
                          filters.education.includes(level)
                            ? 'bg-blue-100 border-blue-300 text-blue-800'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        disabled={!isPremium}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </PremiumFeature>

              <PremiumFeature>
                {/* Height Range */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Height Range: {filters.height[0]}cm - {filters.height[1]}cm
                  </label>
                  <Slider
                    value={filters.height}
                    onValueChange={(value) => isPremium && setFilters(prev => ({ ...prev, height: value as [number, number] }))}
                    min={140}
                    max={220}
                    step={1}
                    className="w-full"
                    disabled={!isPremium}
                  />
                </div>
              </PremiumFeature>

              <PremiumFeature>
                {/* Exercise */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Exercise Frequency</label>
                  <div className="flex flex-wrap gap-2">
                    {exerciseOptions.map((option) => (
                      <Badge
                        key={option}
                        variant={filters.exercise.includes(option) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => isPremium && handleMultiSelect('exercise', option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              </PremiumFeature>

              <PremiumFeature>
                {/* Drinking */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Drinking</label>
                  <div className="flex flex-wrap gap-2">
                    {drinkingOptions.map((option) => (
                      <Badge
                        key={option}
                        variant={filters.drinking.includes(option) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => isPremium && handleMultiSelect('drinking', option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              </PremiumFeature>

              <PremiumFeature>
                {/* Zodiac Signs */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Zodiac Signs</label>
                  <div className="grid grid-cols-4 gap-2">
                    {zodiacSigns.map((sign) => (
                      <Badge
                        key={sign}
                        variant={filters.zodiacSigns.includes(sign) ? "default" : "outline"}
                        className="cursor-pointer text-center justify-center"
                        onClick={() => isPremium && handleMultiSelect('zodiacSigns', sign)}
                      >
                        {sign}
                      </Badge>
                    ))}
                  </div>
                </div>
              </PremiumFeature>

              <PremiumFeature>
                {/* Interests */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {popularInterests.map((interest) => (
                      <Badge
                        key={interest}
                        variant={filters.interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => isPremium && handleMultiSelect('interests', interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </PremiumFeature>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex gap-3">
          <Button variant="outline" onClick={resetFilters} className="flex-1">
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1 bg-pink-500 hover:bg-pink-600">
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
