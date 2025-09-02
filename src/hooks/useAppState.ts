
import { useState } from 'react';
import { User } from '@/types/User';

export const useAppState = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowProfile(false);
    setShowPremium(false);
    setShowNotifications(false);
    setShowEvents(false);
    setShowFilters(false);
    setShowVideoCall(false);
    setSelectedMatchId(null);
    setSelectedOtherUser(null);
  };

  return {
    activeTab,
    selectedMatchId,
    selectedOtherUser,
    showProfile,
    showPremium,
    showNotifications,
    showEvents,
    showFilters,
    showVideoCall,
    setActiveTab,
    setSelectedMatchId,
    setSelectedOtherUser,
    setShowProfile,
    setShowPremium,
    setShowNotifications,
    setShowEvents,
    setShowFilters,
    setShowVideoCall,
    handleTabChange,
  };
};
