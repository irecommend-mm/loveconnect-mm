
import React, { useState } from 'react';
import { User, Edit3, Eye, LogOut, Crown, Shield, Bell, Globe, Heart, ChevronRight, Zap, RotateCcw, Filter, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User as UserType } from '@/types/User';
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

  // Default user settings
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
    // In a real app, you would save these to the database
    console.log('Updated settings:', newSettings);
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
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
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          action: () => handleSettingsClick('notifications'),
          showChevron: true
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
        }
      ]
    },
    {
      title: 'Safety & Verification',
      items: [
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
      ]
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Profile Header */}
      {currentUserProfile && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={currentUserProfile.photos[0] || '/placeholder.svg'}
                alt={currentUserProfile.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              {currentUserProfile.verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{currentUserProfile.name}</h2>
              <p className="text-gray-600">{currentUserProfile.age} • {currentUserProfile.location}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </Button>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      <div className="py-4">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-6 mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${
                    item.highlight ? 'bg-gradient-to-r from-pink-50 to-purple-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`h-5 w-5 ${
                      item.highlight ? 'text-pink-500' : 'text-gray-600'
                    }`} />
                    <span className={`font-medium ${
                      item.highlight ? 'text-pink-700' : 'text-gray-900'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  {item.showChevron && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <div className="px-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && currentUserProfile && (
        <ProfileModal
          user={currentUserProfile}
          onClose={() => setShowProfileModal(false)}
          onEdit={onEditProfile}
          isCurrentUser={true}
        />
      )}

      {/* Boost Modal */}
      <BoostModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={userSettings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Location Settings Modal */}
      <LocationSettings
        open={showLocationSettings}
        onClose={() => setShowLocationSettings(false)}
      />

      {/* Crossed Paths Modal */}
      <CrossedPathsModal
        open={showCrossedPaths}
        onClose={() => setShowCrossedPaths(false)}
      />
    </div>
  );
};

export default SettingsPage;
