
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, Star, Users, Filter, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface FilterPreferences {
  ageRange: [number, number];
  maxDistance: number;
  relationshipType: string[];
  education: string[];
  height: [number, number];
  zodiacSigns: string[];
  smoking: string[];
  drinking: string[];
  exercise: string[];
  children: string[];
  interests: string[];
  verified: boolean;
  onlineOnly: boolean;
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterPreferences) => void;
  currentFilters?: Partial<FilterPreferences>;
}

const AdvancedFilters = ({ isOpen, onClose, onApplyFilters, currentFilters }: AdvancedFiltersProps) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterPreferences>({
    ageRange: [18, 50],
    maxDistance: 50,
    relationshipType: [],
    education: [],
    height: [150, 200],
    zodiacSigns: [],
    smoking: [],
    drinking: [],
    exercise: [],
    children: [],
    interests: [],
    verified: false,
    onlineOnly: false,
    ...currentFilters
  });

  const [availableInterests, setAvailableInterests] = useState<string[]>([]);

  useEffect(() => {
    loadAvailableInterests();
  }, []);

  const loadAvailableInterests = async () => {
    try {
      const { data } = await supabase
        .from('interests')
        .select('interest')
        .order('interest');
      
      if (data) {
        const uniqueInterests = Array.from(new Set(data.map(item => item.interest)));
        setAvailableInterests(uniqueInterests);
      }
    } catch (error) {
      console.error('Error loading interests:', error);
    }
  };

  const relationshipTypes = [
    { value: 'serious', label: 'Serious relationship' },
    { value: 'casual', label: 'Something casual' },
    { value: 'friends', label: 'New friends' },
    { value: 'unsure', label: 'Not sure yet' }
  ];

  const educationLevels = [
    'High School',
    'Some College',
    'Undergraduate Degree',
    'Graduate Degree',
    'PhD/Doctorate',
    'Trade School',
    'Other'
  ];

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const lifestyleOptions = {
    smoking: [
      { value: 'no', label: 'Non-smoker' },
      { value: 'sometimes', label: 'Social smoker' },
      { value: 'yes', label: 'Regular smoker' }
    ],
    drinking: [
      { value: 'no', label: 'Non-drinker' },
      { value: 'sometimes', label: 'Social drinker' },
      { value: 'yes', label: 'Regular drinker' }
    ],
    exercise: [
      { value: 'never', label: 'Not into fitness' },
      { value: 'sometimes', label: 'Sometimes active' },
      { value: 'often', label: 'Very active' }
    ],
    children: [
      { value: 'dont_want', label: "Don't want children" },
      { value: 'unsure', label: 'Not sure about children' },
      { value: 'want', label: 'Want children' },
      { value: 'have', label: 'Have children' }
    ]
  };

  const handleMultiSelectChange = (key: keyof FilterPreferences, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...(prev[key] as string[]), value]
        : (prev[key] as string[]).filter(item => item !== value)
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    setFilters({
      ageRange: [18, 50],
      maxDistance: 50,
      relationshipType: [],
      education: [],
      height: [150, 200],
      zodiacSigns: [],
      smoking: [],
      drinking: [],
      exercise: [],
      children: [],
      interests: [],
      verified: false,
      onlineOnly: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Advanced Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Age Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}</Label>
            <Slider
              value={filters.ageRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
              min={18}
              max={80}
              step={1}
              className="w-full"
            />
          </div>

          {/* Distance */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Maximum Distance: {filters.maxDistance}km
            </Label>
            <Slider
              value={[filters.maxDistance]}
              onValueChange={(value) => setFilters(prev => ({ ...prev, maxDistance: value[0] }))}
              min={1}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Relationship Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <Heart className="h-4 w-4 mr-1" />
              Looking For
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {relationshipTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`relationship-${type.value}`}
                    checked={filters.relationshipType.includes(type.value)}
                    onCheckedChange={(checked) => 
                      handleMultiSelectChange('relationshipType', type.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`relationship-${type.value}`} className="text-sm">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Height Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Height Range: {filters.height[0]}cm - {filters.height[1]}cm</Label>
            <Slider
              value={filters.height}
              onValueChange={(value) => setFilters(prev => ({ ...prev, height: value as [number, number] }))}
              min={140}
              max={220}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Lifestyle Preferences */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Lifestyle Preferences</Label>
            
            {Object.entries(lifestyleOptions).map(([category, options]) => (
              <div key={category} className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground capitalize">
                  {category === 'children' ? 'Children' : category}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${category}-${option.value}`}
                        checked={filters[category as keyof typeof filters]?.includes?.(option.value)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange(category as keyof FilterPreferences, option.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={`${category}-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Zodiac Signs */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <Star className="h-4 w-4 mr-1" />
              Zodiac Signs
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {zodiacSigns.map((sign) => (
                <div key={sign} className="flex items-center space-x-2">
                  <Checkbox
                    id={`zodiac-${sign}`}
                    checked={filters.zodiacSigns.includes(sign.toLowerCase())}
                    onCheckedChange={(checked) => 
                      handleMultiSelectChange('zodiacSigns', sign.toLowerCase(), checked as boolean)
                    }
                  />
                  <Label htmlFor={`zodiac-${sign}`} className="text-xs">
                    {sign}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Interests</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {availableInterests.slice(0, 20).map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interest-${interest}`}
                    checked={filters.interests.includes(interest)}
                    onCheckedChange={(checked) => 
                      handleMultiSelectChange('interests', interest, checked as boolean)
                    }
                  />
                  <Label htmlFor={`interest-${interest}`} className="text-xs">
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Additional Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified-only"
                checked={filters.verified}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verified: checked as boolean }))}
              />
              <Label htmlFor="verified-only" className="text-sm">
                Verified profiles only
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="online-only"
                checked={filters.onlineOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlineOnly: checked as boolean }))}
              />
              <Label htmlFor="online-only" className="text-sm">
                Online users only
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleResetFilters} variant="outline" className="flex-1">
              Reset All
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedFilters;
