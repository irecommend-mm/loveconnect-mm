
import React, { useState } from 'react';
import { User, Edit3, Crown, Zap, Bell, Globe, Filter, MapPin, Shield, LogOut, ChevronRight, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User as UserType } from '@/types/User';
import ProfileModal from './ProfileModal';
import BoostModal from './BoostModal';
import SettingsModal from './SettingsModal';
import { LocationSettings } from './LocationSettings';
import { CrossedPathsModal } from './CrossedPathsModal';
import { UserSettings } from '@/types/User';

interface ModernSettingsPageProps {
  currentUserProfile: UserType | null;
  onEditProfile: () => void;
  onShowPremium: () => void;
}

const ModernSettingsPage = ({ currentUserProfile, onEditProfile, onShowPremium }: ModernSettingsPageProps) => {
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

  return (
    <div className="max-w-md mx-auto bg-gradient-to-b from-pink-50 to-white min-h-screen">
      {/* Modern Profile Header */}
      {currentUserProfile && (
        <div className="relative">
          {/* Background Gradient */}
          <div className="h-32 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600"></div>
          
          {/* Profile Card */}
          <Card className="mx-4 -mt-16 relative z-10 p-6 shadow-xl border-0 bg-white/95 backdrop-blur-md">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarImage src={currentUserProfile.photos[0]} alt={currentUserProfile.name} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-600 text-white text-xl font-bold">
                    {currentUserProfile.name[0]}
                  </AvatarFallback>
                </Avatar>
                {currentUserProfile.verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{currentUserProfile.name}</h2>
                <p className="text-gray-600 font-medium">{currentUserProfile.age} • {currentUserProfile.location}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Active
                  </Badge>
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    Premium
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => setShowProfileModal(true)}
              variant="outline"
              className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 hover:from-pink-600 hover:to-purple-700"
            >
              <User className="w-4 h-4 mr-2" />
              View Full Profile
            </Button>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200"
            onClick={onEditProfile}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Edit Profile</p>
                <p className="text-xs text-gray-600">Update info</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-yellow-50 to-orange-100 border-orange-200"
            onClick={() => setShowBoostModal(true)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Boost</p>
                <p className="text-xs text-gray-600">Get noticed</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="px-4 mt-8 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h3>

        {/* Account Section */}
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="divide-y divide-gray-100">
            <button
              onClick={onShowPremium}
              className="w-full p-4 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-gray-900">Get Premium</span>
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Popular</Badge>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => handleSettingsClick('notifications')}
              className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Notifications</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => setShowLocationSettings(true)}
              className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Location</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </Card>

        {/* Discovery Section */}
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="divide-y divide-gray-100">
            <button
              onClick={() => handleSettingsClick('discovery')}
              className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Discovery Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => setShowCrossedPaths(true)}
              className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Crossed Paths</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </Card>

        {/* Safety Section */}
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="divide-y divide-gray-100">
            <button
              onClick={() => handleSettingsClick('verification')}
              className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Verification</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => handleSettingsClick('privacy')}
              className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Privacy & Safety</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </Card>

        {/* Logout Button */}
        <Card className="border-red-200 bg-red-50">
          <button
            onClick={handleLogout}
            className="w-full p-4 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </Card>
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

export default ModernSettingsPage;
