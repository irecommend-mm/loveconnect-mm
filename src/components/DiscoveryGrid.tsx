import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Star, MapPin, Clock, Users, Heart, Coffee, UserCheck, Navigation, X, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '../types/User';
import ModernProfileModal from './ModernProfileModal';
import MatchCelebrationModal from './MatchCelebrationModal';

import { toast } from '@/hooks/use-toast';

interface DiscoveryGridProps {
  currentUserId: string;
  userLocation?: {lat: number, lng: number} | null;
}

type CategoryType = 'verified' | 'popular' | 'nearby' | 'recent' | 'online' | 'serious' | 'casual' | 'friends' | 'unsure';

interface FilterPreferences {
  ageRange: [number, number];
  maxDistance: number;
  relationshipType: string[];
  education: string[];
  height: [number, number];
  zodiacSigns: string[];
  smoking: string[];
  drinking: string[];
  exercise: string[];
  children: string[];
  interests: string[];
  verified: boolean;
  onlineOnly: boolean;
}

const DiscoveryGrid = ({ currentUserId, userLocation }: DiscoveryGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('nearby');
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserType | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string>('');
  const [swipedUsers, setSwipedUsers] = useState<Set<string>>(new Set());
  const [appliedFilters, setAppliedFilters] = useState<Partial<FilterPreferences>>({});

  const categories = [
    { id: 'nearby' as CategoryType, label: 'Nearby', icon: MapPin, color: 'bg-green-500' },
    { id: 'verified' as CategoryType, label: 'Verified', icon: Shield, color: 'bg-blue-500' },
    { id: 'popular' as CategoryType, label: 'Popular', icon: Star, color: 'bg-yellow-500' },
    { id: 'recent' as CategoryType, label: 'Recent', icon: Clock, color: 'bg-purple-500' },
    { id: 'online' as CategoryType, label: 'Online', icon: UserCheck, color: 'bg-emerald-500' },
  ];

  const relationshipCategories = [
    { id: 'serious' as CategoryType, label: 'Serious', icon: Heart, color: 'bg-red-500' },
    { id: 'casual' as CategoryType, label: 'Casual', icon: Coffee, color: 'bg-orange-500' },
    { id: 'friends' as CategoryType, label: 'Friends', icon: Users, color: 'bg-indigo-500' },
    { id: 'unsure' as CategoryType, label: 'Unsure', icon: Users, color: 'bg-gray-500' },
  ];

  useEffect(() => {
    console.log('DiscoveryGrid: Loading users for category:', selectedCategory);
    loadUsersForCategory(selectedCategory);
    loadCurrentUserPhoto();
    loadSwipedUsers();
  }, [selectedCategory, userLocation]);

  // Also load users when component mounts
  useEffect(() => {
    console.log('DiscoveryGrid: Component mounted, loading initial users');
    loadUsersForCategory(selectedCategory);
  }, []);

  const loadCurrentUserPhoto = async () => {
    try {
      const { data } = await supabase
        .from('photos')
        .select('url')
        .eq('user_id', currentUserId)
        .eq('is_primary', true)
        .single();
      
      if (data) {
        setCurrentUserPhoto(data.url);
      }
    } catch (error) {
      console.log('No primary photo found for current user');
    }
  };

  const loadSwipedUsers = async () => {
    try {
      const { data } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', currentUserId);
      
      if (data) {
        setSwipedUsers(new Set(data.map(swipe => swipe.swiped_id)));
      }
    } catch (error) {
      console.error('Error loading swiped users:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const applyAdvancedFilters = (filters: FilterPreferences) => {
    setAppliedFilters(filters);
    loadUsersForCategory(selectedCategory, filters);
  };

  const loadUsersForCategory = async (category: CategoryType, filters?: Partial<FilterPreferences>) => {
    setLoading(true);
    
    try {
      console.log('Loading users with filters:', filters);
      
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', currentUserId)
        .eq('incognito', false);

      // Apply basic filters
      if (filters?.ageRange) {
        query = query.gte('age', filters.ageRange[0]).lte('age', filters.ageRange[1]);
      }

      if (filters?.verified) {
        query = query.eq('verified', true);
      }

      if (filters?.relationshipType && filters.relationshipType.length > 0) {
        query = query.in('relationship_type', filters.relationshipType);
      }

      if (filters?.smoking && filters.smoking.length > 0) {
        query = query.in('smoking', filters.smoking);
      }

      if (filters?.drinking && filters.drinking.length > 0) {
        query = query.in('drinking', filters.drinking);
      }

      if (filters?.exercise && filters.exercise.length > 0) {
        query = query.in('exercise', filters.exercise);
      }

      if (filters?.children && filters.children.length > 0) {
        query = query.in('children', filters.children);
      }

      if (filters?.zodiacSigns && filters.zodiacSigns.length > 0) {
        query = query.in('zodiac_sign', filters.zodiacSigns);
      }

      // Apply category-specific filters
      switch (category) {
        case 'verified':
          query = query.eq('verified', true);
          break;
        case 'serious':
          query = query.eq('relationship_type', 'serious');
          break;
        case 'casual':
          query = query.eq('relationship_type', 'casual');
          break;
        case 'friends':
          query = query.eq('relationship_type', 'friends');
          break;
        case 'unsure':
          query = query.eq('relationship_type', 'unsure');
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'online':
          if (filters?.onlineOnly) {
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
            query = query.gte('last_active', tenMinutesAgo);
          }
          break;
      }

      const { data: profilesData, error } = await query.limit(50);

      console.log('DiscoveryGrid: Raw profiles data:', profilesData?.length || 0);

      if (error) {
        console.error('Error loading users:', error);
        setLoading(false);
        return;
      }

      const usersWithData = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const lastActiveDate = profile.last_active || profile.updated_at;
          const lastActive = new Date(lastActiveDate);
          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
          const isOnline = lastActive > tenMinutesAgo;

          let distance = null;
          if (userLocation && profile.latitude != null && profile.longitude != null) {
            distance = calculateDistance(
              userLocation.lat, 
              userLocation.lng, 
              Number(profile.latitude), 
              Number(profile.longitude)
            );
          }

          // Get interests from lifestyle JSON field
          const userInterests = (profile.lifestyle as any)?.interests || [];

          // Apply interest filter
          if (filters?.interests && filters.interests.length > 0) {
            const hasMatchingInterest = filters.interests.some(interest => 
              userInterests.includes(interest)
            );
            if (!hasMatchingInterest) return null;
          }

          // Apply distance filter
          if (filters?.maxDistance && distance && distance > filters.maxDistance) {
            return null;
          }

          return {
            id: profile.user_id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio || '',
            // Add sample photos for now - you can implement photo upload later
            photos: [
              'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
            ],
            interests: userInterests,
            location: profile.location || '',
            job: profile.job,
            education: profile.education,
            height: profile.height,
            zodiacSign: profile.zodiac_sign,
            relationshipType: profile.relationship_type as 'serious' | 'casual' | 'friends' | 'unsure' | undefined,
            children: profile.children as 'have' | 'want' | 'dont_want' | 'unsure' | undefined,
            smoking: profile.smoking as 'yes' | 'no' | 'sometimes' | undefined,
            drinking: profile.drinking as 'yes' | 'no' | 'sometimes' | undefined,
            exercise: profile.exercise as 'often' | 'sometimes' | 'never' | undefined,
            verified: profile.verified || false,
            lastActive: new Date(lastActiveDate),
            isOnline,
            distance,
            latitude: profile.latitude,
            longitude: profile.longitude,
          };
        })
      );

      let filteredUsers = usersWithData
        .filter(u => u && u.photos.length > 0) as UserType[];

      if (category === 'nearby' && userLocation) {
        filteredUsers = filteredUsers
          .filter(u => u.distance !== null && u.distance <= (filters?.maxDistance || 100))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));
      } else if (category === 'nearby') {
        filteredUsers = filteredUsers
          .filter(u => u.latitude != null && u.longitude != null)
          .sort((a, b) => a.name.localeCompare(b.name));
      }

      console.log('DiscoveryGrid: Final filtered users:', filteredUsers.length);
      setUsers(filteredUsers.slice(0, 20));
      setLoading(false);
    } catch (error) {
      console.error('Error in loadUsersForCategory:', error);
      setLoading(false);
    }
  };

  const handleUserClick = (user: UserType) => {
    setSelectedUser(user);
  };

  const handleLike = async (userId: string) => {
    console.log('handleLike called with userId:', userId);
    try {
      await supabase
        .from('swipes')
        .insert({
          swiper_id: currentUserId,
          swiped_id: userId,
          action: 'like'
        });

      setSwipedUsers(prev => new Set([...prev, userId]));
      // Remove the user from the current list
      setUsers(prev => {
        console.log('Removing user from list:', userId);
        return prev.filter(user => user.id !== userId);
      });
      
      toast({
        title: "Liked!",
        description: "Profile moved to your likes!",
      });
    } catch (error) {
      console.error('Error liking user:', error);
      toast({
        title: "Error",
        description: "Failed to like user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePass = async (userId: string) => {
    try {
      await supabase
        .from('swipes')
        .insert({
          swiper_id: currentUserId,
          swiped_id: userId,
          action: 'dislike'
        });

      setSwipedUsers(prev => new Set([...prev, userId]));
      // Remove the user from the current list
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: "Passed",
        description: "Profile removed from view",
      });
    } catch (error) {
      console.error('Error passing user:', error);
      toast({
        title: "Error",
        description: "Failed to pass user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSuperLike = async (userId: string) => {
    try {
      await supabase
        .from('swipes')
        .insert({
          swiper_id: currentUserId,
          swiped_id: userId,
          action: 'super_like'
        });

      setSwipedUsers(prev => new Set([...prev, userId]));
      // Remove the user from the current list
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: "Super Liked!",
        description: "Profile moved to your super likes!",
      });
    } catch (error) {
      console.error('Error super liking user:', error);
      toast({
        title: "Error",
        description: "Failed to super like user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Undo/rewind functionality
  const [rewindStack, setRewindStack] = useState<UserType[]>([]);
  const [canRewind, setCanRewind] = useState(false);

  const handleUndo = () => {
    if (rewindStack.length > 0) {
      const lastUser = rewindStack[rewindStack.length - 1];
      setUsers(prev => [lastUser, ...prev]);
      setRewindStack(prev => prev.slice(0, -1));
      setCanRewind(rewindStack.length > 1);
    }
  };

  // Update rewind stack when users are removed
  useEffect(() => {
    if (users.length > 0) {
      setCanRewind(rewindStack.length > 0);
    }
  }, [users, rewindStack]);

  const renderUserCard = (user: UserType) => (
    <div
      key={user.id}
      className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] touch-none"
      onClick={() => handleUserClick(user)}
    >
      <div className="aspect-[3/4] relative">
        <img
          src={user.photos[0]}
          alt={user.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          {user.verified && (
            <div className="bg-blue-500 text-white p-1.5 rounded-full">
              <Shield className="h-3 w-3" />
            </div>
          )}
          {user.isOnline && (
            <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">Online</span>
            </div>
          )}
        </div>

        {/* Clean Bottom Overlay with minimal info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg leading-tight">{user.name}, {user.age}</h3>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUserClick(user);
                }}
                size="sm"
                variant="outline"
                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-gray-100"
              >
                <Users className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
            {user.distance && (
              <div className="flex items-center text-sm text-white/90 mt-1">
                <Navigation className="h-3 w-3 mr-1" />
                <span>{Math.round(user.distance)}km away</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Always Visible on Mobile */}
      <div className="flex items-center justify-center space-x-3 p-3 bg-white border-t border-gray-100">
        {/* Dislike Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setRewindStack(prev => [...prev, user]);
            handlePass(user.id);
          }}
          size="sm"
          variant="outline"
          className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200"
        >
          <X className="h-5 w-5 text-gray-600 hover:text-red-500" />
        </Button>

        {/* Super Like Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setRewindStack(prev => [...prev, user]);
            handleSuperLike(user.id);
          }}
          size="sm"
          className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-200"
        >
          <Star className="h-5 w-5 text-white" />
        </Button>

        {/* Like Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setRewindStack(prev => [...prev, user]);
            handleLike(user.id);
          }}
          size="sm"
          className="w-12 h-12 rounded-full bg-pink-500 hover:bg-pink-600 transition-all duration-200"
        >
          <Heart className="h-5 w-5 text-white" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        
        {/* Undo Button */}
        <Button
          onClick={handleUndo}
          disabled={!canRewind}
          size="sm"
          variant="outline"
          className={`${
            canRewind 
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500' 
              : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
          } transition-all duration-200`}
          title="Undo last action"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Category Tabs - Mobile Optimized */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 px-2">Discover by Type</h2>
        <div className="flex overflow-x-auto pb-2 -mx-2 px-2 sm:grid sm:grid-cols-5 gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  loadUsersForCategory(category.id, appliedFilters);
                }}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`flex-shrink-0 h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2 text-xs sm:text-sm ${
                  selectedCategory === category.id
                    ? `${category.color} text-white hover:opacity-90`
                    : 'hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium leading-tight text-center whitespace-nowrap">{category.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Relationship Type Categories - Mobile Optimized */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 px-2">Discover by Intent</h2>
        <div className="flex overflow-x-auto pb-2 -mx-2 px-2 sm:grid sm:grid-cols-4 gap-2">
          {relationshipCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  loadUsersForCategory(category.id, appliedFilters);
                }}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`flex-shrink-0 h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2 text-xs sm:text-sm ${
                  selectedCategory === category.id
                    ? `${category.color} text-white hover:opacity-90`
                    : 'hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium leading-tight text-center whitespace-nowrap">{category.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Users Grid - Mobile Optimized */}
      <div>
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            {categories.find(c => c.id === selectedCategory)?.label || 
             relationshipCategories.find(c => c.id === selectedCategory)?.label}
            {selectedCategory === 'nearby' && !userLocation && (
              <span className="text-sm text-gray-500 ml-2">(Enable location for distance)</span>
            )}
          </h3>
          <Badge variant="secondary" className="text-xs sm:text-sm">{users.length} people</Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {users.map(renderUserCard)}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-4">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No users found</h3>
            <p className="text-gray-500 text-sm sm:text-base px-4">
              {selectedCategory === 'nearby' && !userLocation 
                ? 'Enable location to see nearby users!'
                : 'Try adjusting your filters or check back later!'}
            </p>
          </div>
        )}
      </div>

      {/* Profile Modal with Actions */}
      {selectedUser && (
        <ModernProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Match Celebration Modal */}
      {showMatchModal && matchedUser && (
        <MatchCelebrationModal
          isOpen={showMatchModal}
          matchedUser={matchedUser}
          onStartChat={() => {
            setShowMatchModal(false);
            toast({
              title: "Opening chat...",
              description: `Starting conversation with ${matchedUser?.name}`,
            });
          }}
          onKeepSwiping={() => setShowMatchModal(false)}
          onClose={() => setShowMatchModal(false)}
        />
      )}
    </div>
  );
};

export default DiscoveryGrid;
