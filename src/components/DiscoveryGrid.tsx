import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Star, MapPin, Clock, Users, Heart, Coffee, UserCheck, Navigation, X } from 'lucide-react';
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

const DiscoveryGrid = ({ currentUserId, userLocation }: DiscoveryGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('nearby');
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserType | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string>('');
  const [swipedUsers, setSwipedUsers] = useState<Set<string>>(new Set());

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
    loadUsersForCategory(selectedCategory);
    loadCurrentUserPhoto();
    loadSwipedUsers();
  }, [selectedCategory, userLocation]);

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

  const loadUsersForCategory = async (category: CategoryType) => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', currentUserId)
        .eq('incognito', false); // Filter out incognito users

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
          // Filter users active within last 10 minutes
          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
          query = query.gte('last_active', tenMinutesAgo);
          break;
        case 'nearby':
          // For nearby, we'll filter after getting the data
          break;
        case 'popular':
          // For now, we'll show all users. In a real app, you'd have a popularity score
          break;
      }

      const { data: profilesData, error } = await query.limit(50);

      if (error) {
        console.error('Error loading users:', error);
        setLoading(false);
        return;
      }

      // Load photos and interests for each user
      const usersWithData = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const [photosResult, interestsResult] = await Promise.all([
            supabase
              .from('photos')
              .select('url')
              .eq('user_id', profile.user_id)
              .order('position'),
            supabase
              .from('interests')
              .select('interest')
              .eq('user_id', profile.user_id)
          ]);

          // Check if user is online (active within last 10 minutes) - handle optional field
          const lastActiveDate = profile.last_active || profile.updated_at;
          const lastActive = new Date(lastActiveDate);
          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
          const isOnline = lastActive > tenMinutesAgo;

          // Calculate distance if both user and profile have coordinates - handle optional fields
          let distance = null;
          if (userLocation && profile.latitude != null && profile.longitude != null) {
            distance = calculateDistance(
              userLocation.lat, 
              userLocation.lng, 
              Number(profile.latitude), 
              Number(profile.longitude)
            );
          }

          return {
            id: profile.user_id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio || '',
            photos: photosResult.data?.map(p => p.url) || [],
            interests: interestsResult.data?.map(i => i.interest) || [],
            location: profile.location || '',
            job: profile.job,
            education: profile.education,
            height: profile.height,
            zodiacSign: profile.zodiac_sign,
            relationshipType: profile.relationship_type as any,
            children: profile.children as any,
            smoking: profile.smoking as any,
            drinking: profile.drinking as any,
            exercise: profile.exercise as any,
            verified: profile.verified || false,
            lastActive: new Date(lastActiveDate),
            isOnline,
            distance,
            latitude: profile.latitude,
            longitude: profile.longitude,
          };
        })
      );

      let filteredUsers = usersWithData.filter(u => u.photos.length > 0);

      // Apply distance filter and sorting for nearby category
      if (category === 'nearby' && userLocation) {
        filteredUsers = filteredUsers
          .filter(u => u.distance !== null && u.distance <= 100) // Show users within 100km
          .sort((a, b) => (a.distance || 0) - (b.distance || 0)); // Sort by closest first
      } else if (category === 'nearby') {
        // If no user location, sort by users who have location data
        filteredUsers = filteredUsers
          .filter(u => u.latitude != null && u.longitude != null)
          .sort((a, b) => a.name.localeCompare(b.name));
      }

      // For demo purposes, show all users including previously swiped ones
      // In a real app, you would filter out swiped users here
      // filteredUsers = filteredUsers.filter(u => !swipedUsers.has(u.id));

      setUsers(filteredUsers.slice(0, 20));
      setLoading(false);
    } catch (error) {
      console.error('Error in loadUsersForCategory:', error);
      setLoading(false);
    }
  };

  const handleLike = async (user: UserType, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // For demo purposes, don't check if swipe already exists
      // This allows users to like the same person multiple times for testing
      
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: currentUserId,
          swiped_id: user.id,
          action: 'like'
        });

      if (error && error.code !== '23505') { // Ignore duplicate key violations for demo
        console.error('Error liking user:', error);
        toast({
          title: "Error",
          description: "Failed to like this profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Check for match
      const { data: matchData } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', user.id)
        .eq('swiped_id', currentUserId)
        .eq('action', 'like')
        .maybeSingle();

      if (matchData) {
        // Create match record
        await supabase
          .from('matches')
          .insert({
            user1_id: currentUserId,
            user2_id: user.id
          });

        // Show animated match modal
        setMatchedUser(user);
        setShowMatchModal(true);
      } else {
        toast({
          title: "Like sent! 💕",
          description: `You liked ${user.name}'s profile.`,
        });
      }

      // For demo: Don't remove user from list, just add to swiped set
      setSwipedUsers(prev => new Set([...prev, user.id]));
    } catch (error) {
      console.error('Error in handleLike:', error);
      toast({
        title: "Like sent! 💕",
        description: `You liked ${user.name}'s profile.`,
      });
    }
  };

  const handleUserClick = (user: UserType) => {
    setSelectedUser(user);
  };

  const handleChatNow = () => {
    setShowMatchModal(false);
    // Navigate to chat - this would typically use router navigation
    toast({
      title: "Opening chat...",
      description: `Starting conversation with ${matchedUser?.name}`,
    });
  };

  const handleContinueBrowsing = () => {
    setShowMatchModal(false);
    setMatchedUser(null);
  };

  const renderUserCard = (user: UserType) => (
    <div
      key={user.id}
      className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
    >
      <div 
        className="aspect-[3/4] relative"
        onClick={() => handleUserClick(user)}
      >
        <img
          src={user.photos[0]}
          alt={user.name}
          className="w-full h-full object-cover"
        />
        
        {/* Swiped Indicator for Demo */}
        {swipedUsers.has(user.id) && (
          <div className="absolute top-3 left-3 bg-pink-500 text-white px-2 py-1 rounded-full text-xs">
            Liked ❤️
          </div>
        )}
        
        {/* Online Status */}
        {user.isOnline && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
        )}
        
        {/* Verification Badge */}
        {user.verified && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white p-1.5 rounded-full">
            <Shield className="h-3 w-3" />
          </div>
        )}

        {/* Distance Badge */}
        {user.distance && (
          <div className="absolute bottom-20 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <Navigation className="h-3 w-3" />
            <span>{Math.round(user.distance)}km</span>
          </div>
        )}

        {/* Action Buttons Container */}
        <div className="absolute bottom-3 right-3 flex flex-col space-y-2">
          {/* Dislike Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle dislike
            }}
            className="w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all duration-200 group"
          >
            <X className="h-5 w-5 text-gray-600 group-hover:text-red-500 transition-colors" />
          </button>

          {/* Super Like/Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle super like
            }}
            className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all duration-200 group"
          >
            <Star className="h-5 w-5 text-white fill-current group-hover:animate-pulse" />
          </button>

          {/* Like Button */}
          <button
            onClick={(e) => handleLike(user, e)}
            className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all duration-200 group"
          >
            <Heart className="h-5 w-5 text-white fill-current group-hover:animate-pulse" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg">{user.name}, {user.age}</h3>
          <div className="flex items-center space-x-1 text-white/90 text-sm">
            <MapPin className="h-3 w-3" />
            <span>{user.location}</span>
            {user.distance && (
              <>
                <span>•</span>
                <span>{Math.round(user.distance)}km away</span>
              </>
            )}
          </div>
          
          {user.interests.length > 0 && (
            <div className="flex space-x-1 mt-2">
              {user.interests.slice(0, 2).map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-white/20 text-white border-0"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {/* Category Tabs - Mobile Optimized */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 px-2">Discover by Type</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2 text-xs sm:text-sm ${
                  selectedCategory === category.id
                    ? `${category.color} text-white hover:opacity-90`
                    : 'hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium leading-tight text-center">{category.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Relationship Type Categories - Mobile Optimized */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 px-2">Discover by Intent</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {relationshipCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2 text-xs sm:text-sm ${
                  selectedCategory === category.id
                    ? `${category.color} text-white hover:opacity-90`
                    : 'hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium leading-tight text-center">{category.label}</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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

      {/* Profile Modal */}
      {selectedUser && (
        <ModernProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          showActions={false}
        />
      )}

      {/* Match Celebration Modal */}
      {showMatchModal && matchedUser && (
        <MatchCelebrationModal
          isOpen={showMatchModal}
          matchedUser={matchedUser}
          currentUserPhoto={currentUserPhoto}
          onChatNow={handleChatNow}
          onContinueBrowsing={handleContinueBrowsing}
          onClose={() => setShowMatchModal(false)}
        />
      )}
    </div>
  );
};

export default DiscoveryGrid;
