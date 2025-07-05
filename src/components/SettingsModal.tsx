
import React, { useState } from 'react';
import { X, Shield, Bell, Eye, EyeOff, Camera, Check } from 'lucide-react';
import { UserSettings } from '@/types/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SettingsModalProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onClose: () => void;
}

const SettingsModal = ({ settings, onUpdateSettings, onClose }: SettingsModalProps) => {
  const { user } = useAuth();
  const [currentSettings, setCurrentSettings] = useState<UserSettings>(settings);
  const [activeTab, setActiveTab] = useState<'notifications' | 'privacy' | 'discovery' | 'verification'>('notifications');
  const [verificationStep, setVerificationStep] = useState<'start' | 'camera' | 'review' | 'submitted'>('start');
  const [verificationPhotos, setVerificationPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleSave = () => {
    onUpdateSettings(currentSettings);
    onClose();
  };

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setCurrentSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleVerificationPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `verification_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `verification/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      setVerificationPhotos(prev => [...prev, publicUrl]);
      
      if (verificationPhotos.length >= 2) {
        setVerificationStep('review');
      }
    } catch (error) {
      console.error('Error uploading verification photo:', error);
    } finally {
      setUploading(false);
    }
  };

  const submitVerification = async () => {
    if (!user || verificationPhotos.length < 3) return;

    try {
      // In a real app, this would send the photos to a verification service
      // For now, we'll just update the profile as pending verification
      await supabase
        .from('profiles')
        .update({ 
          verified: false // Would be set to true after manual review
        })
        .eq('user_id', user.id);

      setVerificationStep('submitted');
      
      // Create notification about verification submission
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'event_update',
          title: 'Verification Submitted',
          message: 'Your verification request has been submitted and is under review.',
          data: { verification_photos: verificationPhotos }
        });

    } catch (error) {
      console.error('Error submitting verification:', error);
    }
  };

  const renderVerificationContent = () => {
    switch (verificationStep) {
      case 'start':
        return (
          <div className="text-center space-y-4">
            <Shield className="h-16 w-16 text-pink-500 mx-auto" />
            <h3 className="text-xl font-semibold">Get Verified</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Verification helps build trust in the community. We'll need you to take a few photos following our guidelines.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h4 className="font-medium text-blue-900 mb-2">What you'll need:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• A well-lit area</li>
                <li>• Hold up your ID next to your face</li>
                <li>• Take 3 clear photos from different angles</li>
                <li>• Make sure your face is clearly visible</li>
              </ul>
            </div>
            <Button 
              onClick={() => setVerificationStep('camera')}
              className="bg-pink-500 hover:bg-pink-600"
            >
              Start Verification
            </Button>
          </div>
        );

      case 'camera':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Camera className="h-12 w-12 text-pink-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Take Verification Photos</h3>
              <p className="text-gray-600">Upload {3 - verificationPhotos.length} more photo(s)</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {verificationPhotos.map((photo, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={photo} alt={`Verification ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {Array.from({ length: 3 - verificationPhotos.length }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <label className="cursor-pointer">
                    <Camera className="h-8 w-8 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVerificationPhotoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              ))}
            </div>

            {uploading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Uploading photo...</p>
              </div>
            )}

            {verificationPhotos.length >= 3 && (
              <Button 
                onClick={() => setVerificationStep('review')}
                className="w-full bg-pink-500 hover:bg-pink-600"
              >
                Review Photos
              </Button>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Review Your Photos</h3>
              <p className="text-gray-600">Make sure all photos are clear and follow the guidelines</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {verificationPhotos.map((photo, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={photo} alt={`Verification ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setVerificationPhotos([]);
                  setVerificationStep('camera');
                }}
                className="flex-1"
              >
                Retake Photos
              </Button>
              <Button 
                onClick={submitVerification}
                className="flex-1 bg-pink-500 hover:bg-pink-600"
              >
                Submit for Review
              </Button>
            </div>
          </div>
        );

      case 'submitted':
        return (
          <div className="text-center space-y-4">
            <Check className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Verification Submitted!</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Your verification request has been submitted. We'll review it within 24-48 hours and notify you of the result.
            </p>
            <Button onClick={onClose} className="bg-pink-500 hover:bg-pink-600">
              Done
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100">
          {[
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy', icon: EyeOff },
            { id: 'discovery', label: 'Discovery', icon: Eye },
            { id: 'verification', label: 'Verification', icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">New matches</Label>
                  <p className="text-sm text-gray-600">Get notified when you have a new match</p>
                </div>
                <Switch
                  checked={currentSettings.notifications.matches}
                  onCheckedChange={(checked) => updateSettings('notifications', 'matches', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Messages</Label>
                  <p className="text-sm text-gray-600">Get notified about new messages</p>
                </div>
                <Switch
                  checked={currentSettings.notifications.messages}
                  onCheckedChange={(checked) => updateSettings('notifications', 'messages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Likes</Label>
                  <p className="text-sm text-gray-600">Get notified when someone likes you</p>
                </div>
                <Switch
                  checked={currentSettings.notifications.likes}
                  onCheckedChange={(checked) => updateSettings('notifications', 'likes', checked)}
                />
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Show age</Label>
                  <p className="text-sm text-gray-600">Display your age on your profile</p>
                </div>
                <Switch
                  checked={currentSettings.privacy.showAge}
                  onCheckedChange={(checked) => updateSettings('privacy', 'showAge', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Show distance</Label>
                  <p className="text-sm text-gray-600">Display distance from other users</p>
                </div>
                <Switch
                  checked={currentSettings.privacy.showDistance}
                  onCheckedChange={(checked) => updateSettings('privacy', 'showDistance', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Incognito mode</Label>
                  <p className="text-sm text-gray-600">Browse profiles without being seen</p>
                </div>
                <Switch
                  checked={currentSettings.privacy.incognito}
                  onCheckedChange={(checked) => updateSettings('privacy', 'incognito', checked)}
                />
              </div>
            </div>
          )}

          {activeTab === 'discovery' && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-4 block">Age range: {currentSettings.discovery.ageRange[0]} - {currentSettings.discovery.ageRange[1]}</Label>
                <Slider
                  value={currentSettings.discovery.ageRange}
                  onValueChange={(value) => updateSettings('discovery', 'ageRange', value)}
                  min={18}
                  max={65}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="text-base font-medium mb-4 block">Maximum distance: {currentSettings.discovery.maxDistance} km</Label>
                <Slider
                  value={[currentSettings.discovery.maxDistance]}
                  onValueChange={(value) => updateSettings('discovery', 'maxDistance', value[0])}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="text-base font-medium mb-2 block">Looking for</Label>
                <Select
                  value={currentSettings.discovery.relationshipType}
                  onValueChange={(value) => updateSettings('discovery', 'relationshipType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Something casual</SelectItem>
                    <SelectItem value="serious">Long-term relationship</SelectItem>
                    <SelectItem value="friends">New friends</SelectItem>
                    <SelectItem value="unsure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-base font-medium mb-2 block">Show me</Label>
                <Select
                  value={currentSettings.discovery.showMe}
                  onValueChange={(value) => updateSettings('discovery', 'showMe', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="everyone">Everyone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div>
              {renderVerificationContent()}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab !== 'verification' && (
          <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-pink-500 hover:bg-pink-600">
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
