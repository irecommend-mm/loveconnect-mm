import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coffee, Plane, Dog, Brain, Laptop, Music, Mountain, Palette, Dumbbell, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '../types/User';
import ModernProfileModal from './ModernProfileModal';

interface DiscoverByInterestPageProps {
  currentUserId: string;
  userLocation?: {lat: number, lng: number} | null;
}

type CategoryType = 'cafe_lover' | 'traveller' | 'animal_lover' | 'mindfulness' | 'digital_nomad' | 'nightlife' | 'adventure' | 'creative' | 'fitness' | 'foodie';

const DiscoverByInterestPage = ({ currentUserId, userLocation }: DiscoverByInterestPageProps) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('cafe_lover');
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const interestCategories = [
    { id: 'cafe_lover' as CategoryType, label: 'Cafe Lover', icon: Coffee, color: 'bg-amber-600', interests: ['Coffee', 'Food', 'Restaurants'] },
    { id: 'traveller' as CategoryType, label: 'Traveller', icon: Plane, color: 'bg-sky-500', interests: ['Travel'] },
    { id: 'animal_lover' as CategoryType, label: 'Animal Lover', icon: Dog, color: 'bg-green-600', interests: ['Conservation', 'Nature', 'Environment'] },
    { id: 'mindfulness' as CategoryType, label: 'Mindfulness', icon: Brain, color: 'bg-purple-500', interests: ['Meditation', 'Yoga', 'Wellness', 'Mindfulness'] },
    { id: 'digital_nomad' as CategoryType, label: 'Digital Nomad', icon: Laptop, color: 'bg-blue-600', interests: ['Technology', 'Programming', 'Coding', 'AI', 'Startups', 'Entrepreneurship'] },
    { id: 'nightlife' as CategoryType, label: 'Nightlife', icon: Music, color: 'bg-pink-600', interests: ['Dancing', 'Concerts', 'Music'] },
    { id: 'adventure' as CategoryType, label: 'Adventure', icon: Mountain, color: 'bg-teal-600', interests: ['Hiking', 'Rock Climbing', 'Camping', 'Skiing', 'Diving'] },
    { id: 'creative' as CategoryType, label: 'Creative', icon: Palette, color: 'bg-rose-500', interests: ['Art', 'Design', 'Photography', 'Writing', 'Painting', 'Music'] },
    { id: 'fitness' as CategoryType, label: 'Fitness', icon: Dumbbell, color: 'bg-red-600', interests: ['Fitness', 'Sports', 'Soccer', 'Tennis', 'Swimming', 'Yoga'] },
    { id: 'foodie' as CategoryType, label: 'Foodie', icon: UtensilsCrossed, color: 'bg-orange-600', interests: ['Cooking', 'Food', 'Wine', 'Restaurants'] },
  ];

  useEffect(() => {
    loadUsersForCategory(selectedCategory);
  }, [selectedCategory]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
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
        .eq('incognito', false);

      const { data: profilesData, error } = await query.limit(50);

      if (error) {
        console.error('Error loading users:', error);
        setLoading(false);
        return;
      }

      const currentInterestCategory = interestCategories.find(cat => cat.id === category);
      
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

          const userInterests = (profile.lifestyle as any)?.interests || [];
          
          // Filter by interest category
          if (currentInterestCategory) {
            const hasMatchingCategoryInterest = currentInterestCategory.interests.some(interest => 
              userInterests.includes(interest)
            );
            if (!hasMatchingCategoryInterest) return null;
          }

          return {
            id: profile.user_id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio || '',
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

      let filteredUsers = usersWithData.filter(u => u && u.photos.length > 0) as UserType[];
      setUsers(filteredUsers.slice(0, 24));
      setLoading(false);
    } catch (error) {
      console.error('Error in loadUsersForCategory:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Discover by Interest</h1>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
          {interestCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex flex-col items-center space-y-1 h-auto py-3"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs text-center">{category.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedUser(user)}
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={user.photos[0]}
                    alt={user.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Interest indicators */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[80%]">
                    {user.interests.slice(0, 2).map((interest, index) => (
                      <div key={index} className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                        {interest}
                      </div>
                    ))}
                    {user.interests.length > 2 && (
                      <div className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                        +{user.interests.length - 2}
                      </div>
                    )}
                  </div>

                  {/* User info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="text-white">
                      <p className="font-semibold text-sm truncate">{user.name}, {user.age}</p>
                      {user.location && (
                        <p className="text-xs opacity-90 truncate">{user.location}</p>
                      )}
                      {user.distance && (
                        <p className="text-xs opacity-90">{Math.round(user.distance)} km away</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found with these interests</p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedUser && (
        <ModernProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default DiscoverByInterestPage;