
import React, { useState } from 'react';
import { X, User, Bell, Shield, Search, Camera } from 'lucide-react';
import { UserSettings, DiscoveryPreferences } from '../types/User';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface SettingsModalProps {
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

const SettingsModal = ({ onClose, settings, onUpdateSettings }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'discovery' | 'notifications' | 'privacy'>('profile');
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const updateDiscoverySettings = (updates: Partial<DiscoveryPreferences>) => {
    setLocalSettings(prev => ({
      ...prev,
      discovery: { ...prev.discovery, ...updates }
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'discovery', label: 'Discovery', icon: Search },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <button className="text-pink-600 font-medium hover:underline">
                  Add Photos
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Show my age
                  </label>
                  <Switch
                    checked={localSettings.privacy.showAge}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, showAge: checked }
                      }))
                    }
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Show distance
                  </label>
                  <Switch
                    checked={localSettings.privacy.showDistance}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, showDistance: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discovery' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Age Range: {localSettings.discovery.ageRange[0]} - {localSettings.discovery.ageRange[1]}
                </label>
                <Slider
                  value={localSettings.discovery.ageRange}
                  onValueChange={(value) => updateDiscoverySettings({ ageRange: value as [number, number] })}
                  min={18}
                  max={65}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Maximum Distance: {localSettings.discovery.maxDistance} km
                </label>
                <Slider
                  value={[localSettings.discovery.maxDistance]}
                  onValueChange={(value) => updateDiscoverySettings({ maxDistance: value[0] })}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show me
                </label>
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
                        checked={localSettings.discovery.showMe === option.value}
                        onChange={(e) => updateDiscoverySettings({ showMe: e.target.value as any })}
                        className="text-pink-600"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Looking for
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'serious', label: 'Something serious' },
                    { value: 'casual', label: 'Something casual' },
                    { value: 'friends', label: 'New friends' },
                    { value: 'unsure', label: "I'm not sure yet" }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value={option.value}
                        checked={localSettings.discovery.relationshipType === option.value}
                        onChange={(e) => updateDiscoverySettings({ relationshipType: e.target.value as any })}
                        className="text-pink-600"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">New matches</h3>
                    <p className="text-sm text-gray-500">Get notified when you have a new match</p>
                  </div>
                  <Switch
                    checked={localSettings.notifications.matches}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, matches: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">New messages</h3>
                    <p className="text-sm text-gray-500">Get notified when you receive a message</p>
                  </div>
                  <Switch
                    checked={localSettings.notifications.messages}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, messages: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">New likes</h3>
                    <p className="text-sm text-gray-500">Get notified when someone likes you</p>
                  </div>
                  <Switch
                    checked={localSettings.notifications.likes}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, likes: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Incognito Mode</h3>
                    <p className="text-sm text-gray-500">Only people you like can see your profile</p>
                  </div>
                  <Switch
                    checked={localSettings.privacy.incognito}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, incognito: checked }
                      }))
                    }
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-2">Account Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-gray-600 hover:text-gray-800 py-2">
                      Block Contacts
                    </button>
                    <button className="w-full text-left text-sm text-gray-600 hover:text-gray-800 py-2">
                      Report a Problem
                    </button>
                    <button className="w-full text-left text-sm text-red-600 hover:text-red-800 py-2">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
