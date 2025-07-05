
import React, { useState } from 'react';
import { X, Filter, MapPin, Heart, Users, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface EnhancedFiltersProps {
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

interface FilterOptions {
  ageRange: [number, number];
  maxDistance: number;
  heightRange: [number, number];
  education: string[];
  jobField: string[];
  relationshipType: string[];
  lifestyle: {
    smoking: string[];
    drinking: string[];
    exercise: string[];
  };
  verified: boolean;
  recentlyActive: boolean;
}

const EnhancedFilters = ({ onClose, onApply, currentFilters }: EnhancedFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const educationOptions = [
    'High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree', 
    'PhD', 'Trade School', 'Other'
  ];

  const jobFieldOptions = [
    'Technology', 'Healthcare', 'Education', 'Finance', 'Arts & Entertainment',
    'Marketing', 'Sales', 'Engineering', 'Law', 'Business', 'Other'
  ];

  const relationshipOptions = [
    'Long-term relationship', 'Short-term fun', 'New friends', 'Not sure yet'
  ];

  const lifestyleOptions = {
    smoking: ['Never', 'Sometimes', 'Often'],
    drinking: ['Never', 'Sometimes', 'Often'],
    exercise: ['Never', 'Sometimes', 'Often']
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      ageRange: [18, 65],
      maxDistance: 50,
      heightRange: [150, 200],
      education: [],
      jobField: [],
      relationshipType: [],
      lifestyle: {
        smoking: [],
        drinking: [],
        exercise: []
      },
      verified: false,
      recentlyActive: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Advanced Filters
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
          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
            </label>
            <Slider
              value={filters.ageRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
              min={18}
              max={65}
              step={1}
              className="w-full"
            />
          </div>

          {/* Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              <MapPin className="h-4 w-4 inline mr-1" />
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

          {/* Height Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Height Range: {filters.heightRange[0]}cm - {filters.heightRange[1]}cm
            </label>
            <Slider
              value={filters.heightRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, heightRange: value as [number, number] }))}
              min={140}
              max={220}
              step={1}
              className="w-full"
            />
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <GraduationCap className="h-4 w-4 inline mr-1" />
              Education
            </label>
            <div className="grid grid-cols-2 gap-2">
              {educationOptions.map(option => (
                <label key={option} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.education.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({ ...prev, education: [...prev.education, option] }));
                      } else {
                        setFilters(prev => ({ ...prev, education: prev.education.filter(ed => ed !== option) }));
                      }
                    }}
                    className="rounded text-pink-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Job Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Briefcase className="h-4 w-4 inline mr-1" />
              Job Field
            </label>
            <div className="grid grid-cols-2 gap-2">
              {jobFieldOptions.map(option => (
                <label key={option} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.jobField.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({ ...prev, jobField: [...prev.jobField, option] }));
                      } else {
                        setFilters(prev => ({ ...prev, jobField: prev.jobField.filter(job => job !== option) }));
                      }
                    }}
                    className="rounded text-pink-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Relationship Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Heart className="h-4 w-4 inline mr-1" />
              Looking For
            </label>
            <div className="space-y-2">
              {relationshipOptions.map(option => (
                <label key={option} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.relationshipType.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({ ...prev, relationshipType: [...prev.relationshipType, option] }));
                      } else {
                        setFilters(prev => ({ ...prev, relationshipType: prev.relationshipType.filter(rel => rel !== option) }));
                      }
                    }}
                    className="rounded text-pink-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lifestyle Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Lifestyle Preferences
            </label>
            
            {Object.entries(lifestyleOptions).map(([category, options]) => (
              <div key={category} className="mb-4">
                <p className="text-sm text-gray-600 mb-2 capitalize">{category}:</p>
                <div className="flex flex-wrap gap-2">
                  {options.map(option => (
                    <label key={option} className="flex items-center space-x-1 text-xs">
                      <input
                        type="checkbox"
                        checked={filters.lifestyle[category as keyof typeof filters.lifestyle].includes(option)}
                        onChange={(e) => {
                          const categoryKey = category as keyof typeof filters.lifestyle;
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              lifestyle: {
                                ...prev.lifestyle,
                                [categoryKey]: [...prev.lifestyle[categoryKey], option]
                              }
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              lifestyle: {
                                ...prev.lifestyle,
                                [categoryKey]: prev.lifestyle[categoryKey].filter(item => item !== option)
                              }
                            }));
                          }
                        }}
                        className="rounded text-pink-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Verified profiles only</h3>
                <p className="text-sm text-gray-500">Show only verified users</p>
              </div>
              <Switch
                checked={filters.verified}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verified: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Recently active</h3>
                <p className="text-sm text-gray-500">Active in the last 7 days</p>
              </div>
              <Switch
                checked={filters.recentlyActive}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, recentlyActive: checked }))}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex space-x-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 py-3 rounded-full"
          >
            Reset All
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-full font-medium"
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFilters;
