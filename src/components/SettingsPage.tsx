
import React, { useState } from 'react';
import { User, Edit3, LogOut, Crown, Shield, Bell, Globe, Heart, Zap, Filter, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User as UserType } from '@/types/User';
import { ProfileHeader } from './settings/ProfileHeader';
import { SettingsSection } from './settings/SettingsSection';
import ProfileModal from './ProfileModal';
import BoostModal from './BoostModal';
import SettingsModal from './SettingsModal';
import { LocationSettings } from './LocationSettings';
import { CrossedPathsModal } from './CrossedPathsModal';
import { UserSettings } from '@/types/User';

interface SettingsPageProps {
  currentUserProfile: UserType | null;
  onEditProfile: () => void;
  onShowPremium: () => void;
}

const SettingsPage = ({ currentUserProfile, onEditProfile, onShowPremium }: SettingsPageProps) => {
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [showCrossedPaths, setShowCrossedPaths] = useState(false);
  const [settingsType, setSettingsType] = useState<'notifications' | 'privacy' | 'discovery' | 'verification'>('notifications');

  const defaultSettings: UserSettings = {
    notifications: {
      matches: true,
      messages: true,
      likes: true,
    },
    privacy: {
      showAge: true,
      showDistance: true,
      incognito: false,
    },
    discovery: {
      ageRange: [22, 35],
      maxDistance: 50,
      relationshipType: 'serious',
      showMe: 'everyone',
    },
  };

  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSettingsClick = (type: 'notifications' | 'privacy' | 'discovery' | 'verification') => {
    setSettingsType(type);
    setShowSettingsModal(true);
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    console.log('Updated settings:', newSettings);
  };

  const accountItems = [
    {
      icon: User,
      label: 'View Profile',
      action: () => setShowProfileModal(true),
      showChevron: true
    },
    {
      icon: Edit3,
      label: 'Edit Profile',
      action: onEditProfile,
      showChevron: true
    },
    {
      icon: Crown,
      label: 'Get Premium',
      action: onShowPremium,
      showChevron: true,
      highlight: true
    },
    {
      icon: Zap,
      label: 'Boost Your Profile',
      action: () => setShowBoostModal(true),
      showChevron: true,
      highlight: true
    }
  ];

  const preferencesItems = [
    {
      icon: Bell,
      label: 'Notifications',
      action: () => handleSettingsClick('notifications'),
      showChevron: true,
      badge: '3'
    },
    {
      icon: Globe,
      label: 'Location',
      action: () => setShowLocationSettings(true),
      showChevron: true
    },
    {
      icon: Filter,
      label: 'Discovery Settings',
      action: () => handleSettingsClick('discovery'),
      showChevron: true
    },
    {
      icon: MapPin,
      label: 'Crossed Paths',
      action: () => setShowCrossedPaths(true),
      showChevron: true
    },
    {
      icon: Users,
      label: 'Local Events & Meetups',
      action: () => console.log('Local Events & Meetups'),
      showChevron: true
    }
  ];

  const safetyItems = [
    {
      icon: Shield,
      label: 'Verification',
      action: () => handleSettingsClick('verification'),
      showChevron: true
    },
    {
      icon: Shield,
      label: 'Safety Center',
      action: () => handleSettingsClick('privacy'),
      showChevron: true
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <ProfileHeader 
        currentUserProfile={currentUserProfile}
        onViewProfile={() => setShowProfileModal(true)}
      />

      <div className="py-6">
        <SettingsSection title="Account" items={accountItems} />
        <SettingsSection title="Preferences" items={preferencesItems} />
        <SettingsSection title="Safety & Verification" items={safetyItems} />

        <div className="px-6 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-4 text-red-600 hover:bg-red-50 rounded-2xl transition-colors bg-white shadow-sm"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showProfileModal && currentUserProfile && (
        <ProfileModal
          user={currentUserProfile}
          onClose={() => setShowProfileModal(false)}
          onEdit={onEditProfile}
          isCurrentUser={true}
        />
      )}

      <BoostModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
      />

      {showSettingsModal && (
        <SettingsModal
          settings={userSettings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      <LocationSettings
        open={showLocationSettings}
        onClose={() => setShowLocationSettings(false)}
      />

      <CrossedPathsModal
        open={showCrossedPaths}
        onClose={() => setShowCrossedPaths(false)}
      />
    </div>
  );
};

export default SettingsPage;
