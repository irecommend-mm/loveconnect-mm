
import { useState, useEffect } from 'react';
import { useAppMode } from './useAppMode';
import { UserFilters } from '@/types/FriendDateTypes';

export const useFilterIntegration = () => {
  const { currentMode } = useAppMode();
  const [filters, setFilters] = useState<UserFilters>({
    ageRange: [22, 35],
    maxDistance: 25,
    showMe: 'everyone',
    verifiedOnly: false,
    hasPhotos: true,
    onlineOnly: false,
  });

  useEffect(() => {
    // Load mode-specific filters from localStorage
    const savedFilters = localStorage.getItem(`fd-filters-${currentMode}`);
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(prev => ({ ...prev, ...parsedFilters }));
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
  }, [currentMode]);

  const updateFilters = (newFilters: Partial<UserFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Save mode-specific filters
    localStorage.setItem(`fd-filters-${currentMode}`, JSON.stringify(updatedFilters));
  };

  const resetFilters = () => {
    const defaultFilters: UserFilters = {
      ageRange: [22, 35],
      maxDistance: 25,
      showMe: 'everyone',
      verifiedOnly: false,
      hasPhotos: true,
      onlineOnly: false,
    };
    
    setFilters(defaultFilters);
    localStorage.removeItem(`fd-filters-${currentMode}`);
  };

  return {
    filters,
    updateFilters,
    resetFilters,
    currentMode,
  };
};
