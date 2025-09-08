import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Coffee, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '../types/User';
import ModernProfileModal from './ModernProfileModal';

interface DiscoverByIntentPageProps {
  currentUserId: string;
  userLocation?: {lat: number, lng: number} | null;
}

type CategoryType = 'serious' | 'casual' | 'friends' | 'unsure';

const DiscoverByIntentPage = ({ currentUserId, userLocation }: DiscoverByIntentPageProps) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('serious');
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const categories = [
    { id: 'serious' as CategoryType, label: 'Serious', icon: Heart, color: 'bg-red-500' },
    { id: 'casual' as CategoryType, label: 'Casual', icon: Coffee, color: 'bg-orange-500' },
    { id: 'friends' as CategoryType, label: 'Friends', icon: Users, color: 'bg-indigo-500' },
    { id: 'unsure' as CategoryType, label: 'Unsure', icon: Users, color: 'bg-gray-500' },
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
        .eq('incognito', false)
        .eq('relationship_type', category);

      const { data: profilesData, error } = await query.limit(50);

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

          const userInterests = (profile.lifestyle as any)?.interests || [];

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
            <h1 className="text-2xl font-bold">Discover by Intent</h1>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
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
                  
                  {/* Relationship type badge */}
                  <div className="absolute top-2 right-2">
                    <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium capitalize">
                      {user.relationshipType}
                    </div>
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
            <p className="text-muted-foreground">No users found in this category</p>
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

export default DiscoverByIntentPage;