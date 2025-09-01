
import { useState, useEffect } from 'react';
import { AppMode } from '@/types/FriendDateTypes';

export const useAppMode = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>('friend');

  useEffect(() => {
    // Load saved mode from localStorage
    const savedMode = localStorage.getItem('fd-app-mode') as AppMode;
    if (savedMode && (savedMode === 'friend' || savedMode === 'date')) {
      setCurrentMode(savedMode);
    }
  }, []);

  const switchMode = (mode: AppMode) => {
    setCurrentMode(mode);
    localStorage.setItem('fd-app-mode', mode);
  };

  return {
    currentMode,
    switchMode,
    isFriendMode: currentMode === 'friend',
    isDateMode: currentMode === 'date'
  };
};
