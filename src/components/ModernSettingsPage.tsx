
import React, { useState } from 'react';
import { User, Settings, Crown, Shield, Heart, Bell, MapPin, Eye, Users, Star, Award, Zap, LogOut, Edit3, Globe, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserType } from '@/types/User';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ModernSettingsPageProps {
  currentUserProfile: UserType | null;
  onEditProfile: () => void;
  onShowPremium: () => void;
}

const ModernSettingsPage = ({ 
  currentUserProfile, 
  onEditProfile, 
  onShowPremium 
}: ModernSettingsPageProps) => {
  const { signOut } = useAuth();
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    likes: false
  });

  const [privacy, setPrivacy] = useState({
    showAge: true,
    showDistance: true,
    incognito: false
  });

  const userStats = {
    profileViews: 147,
    matches: 23,
    likes: 89,
    completeness: 85
  };

  const badges = [
    { name: 'Verified', icon: Shield, color: 'bg-blue-500', active: currentUserProfile?.verified },
    { name: 'Active', icon: Zap, color: 'bg-green-500', active: true },
    { name: 'Premium', icon: Crown, color: 'bg-yellow-500', active: false },
    { name: 'Popular', icon: Star, color: 'bg-purple-500', active: userStats.likes > 50 }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 pb-20">
      {/* Header with Profile Card */}
      <div className="relative bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 pt-16 pb-8">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-4 max-w-md mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-16 w-16 ring-4 ring-white/30">
                  <AvatarImage 
                    src={currentUserProfile?.photos?.[0]} 
                    alt={currentUserProfile?.name} 
                  />
                  <AvatarFallback className="bg-white/20 text-white text-xl">
                    {currentUserProfile?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{currentUserProfile?.name}</h2>
                  <p className="text-white/80 text-sm">{currentUserProfile?.age} years old</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs text-white/80">Online now</span>
                  </div>
                </div>
              </div>

              {/* User Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {badges.filter(badge => badge.active).map((badge) => (
                  <Badge key={badge.name} className={`${badge.color} text-white border-0`}>
                    <badge.icon className="h-3 w-3 mr-1" />
                    {badge.name}
                  </Badge>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold">{userStats.profileViews}</div>
                  <div className="text-xs text-white/80">Views</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{userStats.matches}</div>
                  <div className="text-xs text-white/80">Matches</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{userStats.likes}</div>
                  <div className="text-xs text-white/80">Likes</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{userStats.completeness}%</div>
                  <div className="text-xs text-white/80">Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 max-w-md mx-auto -mt-4 space-y-4">
        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Settings className="h-5 w-5 mr-2 text-purple-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={onEditProfile}
              className="w-full justify-start bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button 
              onClick={onShowPremium}
              variant="outline"
              className="w-full justify-start border-yellow-400 text-yellow-600 hover:bg-yellow-50"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline"
              className="w-full justify-start"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button 
              variant="outline"
              className="w-full justify-start"
            >
              <Zap className="h-4 w-4 mr-2" />
              Boost Profile
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Globe className="h-5 w-5 mr-2 text-green-600" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline"
              className="w-full justify-start"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Location Settings
            </Button>
            <Button 
              variant="outline"
              className="w-full justify-start"
            >
              <Filter className="h-4 w-4 mr-2" />
              Discovery Settings
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Bell className="h-5 w-5 mr-2 text-blue-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Heart className="h-4 w-4 text-red-500" />
                <div>
                  <p className="font-medium">New Matches</p>
                  <p className="text-sm text-gray-600">Get notified of new matches</p>
                </div>
              </div>
              <Switch 
                checked={notifications.matches}
                onCheckedChange={(checked) => setNotifications({...notifications, matches: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-green-500" />
                <div>
                  <p className="font-medium">Messages</p>
                  <p className="text-sm text-gray-600">New message notifications</p>
                </div>
              </div>
              <Switch 
                checked={notifications.messages}
                onCheckedChange={(checked) => setNotifications({...notifications, messages: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="font-medium">Likes</p>
                  <p className="text-sm text-gray-600">Someone liked your profile</p>
                </div>
              </div>
              <Switch 
                checked={notifications.likes}
                onCheckedChange={(checked) => setNotifications({...notifications, likes: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Shield className="h-5 w-5 mr-2 text-indigo-600" />
              Privacy & Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Show Age</p>
                  <p className="text-sm text-gray-600">Display your age on profile</p>
                </div>
              </div>
              <Switch 
                checked={privacy.showAge}
                onCheckedChange={(checked) => setPrivacy({...privacy, showAge: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-red-500" />
                <div>
                  <p className="font-medium">Show Distance</p>
                  <p className="text-sm text-gray-600">Show distance to other users</p>
                </div>
              </div>
              <Switch 
                checked={privacy.showDistance}
                onCheckedChange={(checked) => setPrivacy({...privacy, showDistance: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="font-medium">Incognito Mode</p>
                  <p className="text-sm text-gray-600">Browse profiles privately</p>
                </div>
              </div>
              <Switch 
                checked={privacy.incognito}
                onCheckedChange={(checked) => setPrivacy({...privacy, incognito: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Premium Features Teaser */}
        <Card className="shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Premium Features</p>
                  <p className="text-sm text-gray-600">Unlock advanced filters & more</p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={onShowPremium}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
              >
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion */}
        {userStats.completeness < 100 && (
          <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Award className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-gray-800">Complete Your Profile</p>
              </div>
              <div className="w-full bg-green-100 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${userStats.completeness}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {userStats.completeness}% complete • Add more photos and interests to get more matches!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Logout Section */}
        <Card className="shadow-lg border-red-100">
          <CardContent className="p-4">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full flex items-center justify-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModernSettingsPage;
