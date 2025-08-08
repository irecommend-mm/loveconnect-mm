
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Eye, Filter, Settings } from 'lucide-react';
import { mockUsers } from '@/data/mockUsers';
import ProfileModal from './ProfileModal';
import AdvancedFilters from './filters/AdvancedFilters';

interface DiscoveryGridProps {
  currentUserId: string;
  userLocation?: { lat: number; lng: number } | null;
}

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
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Simple filter states
  const [ageRange, setAgeRange] = useState({ min: 18, max: 50 });
  const [maxDistance, setMaxDistance] = useState(50);
  const [relationshipGoal, setRelationshipGoal] = useState('all');
  
  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState<Partial<FilterPreferences>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, ageRange, maxDistance, relationshipGoal, advancedFilters]);

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', currentUserId)
        .limit(20);
      
      if (data && data.length > 0) {
        const formattedUsers = data.map(profile => ({
          id: profile.user_id,
          name: profile.name || 'Unknown',
          age: profile.age || 25,
          location: profile.location || 'Unknown',
          photos: profile.photos || ['/placeholder.svg'],
          bio: profile.bio || '',
          interests: profile.interests || [],
          verified: profile.verified || false,
          lastActive: profile.last_active || new Date().toISOString(),
          relationshipGoal: profile.relationship_goal || 'serious',
          education: profile.education || '',
          height: profile.height || 170,
          zodiacSign: profile.zodiac_sign || '',
          smoking: profile.smoking || 'no',
          drinking: profile.drinking || 'sometimes',
          exercise: profile.exercise || 'sometimes',
          children: profile.children || 'unsure',
          latitude: profile.latitude,
          longitude: profile.longitude
        }));
        setUsers(formattedUsers);
      } else {
        setUsers(mockUsers.filter(user => user.id !== currentUserId));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers(mockUsers.filter(user => user.id !== currentUserId));
    }
  };

  const applyFilters = () => {
    let filtered = users.filter(user => {
      // Simple filters
      const ageMatch = user.age >= ageRange.min && user.age <= ageRange.max;
      const relationshipMatch = relationshipGoal === 'all' || user.relationshipGoal === relationshipGoal;
      
      // Distance filter (if location available)
      let distanceMatch = true;
      if (userLocation && user.latitude && user.longitude) {
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          user.latitude, user.longitude
        );
        distanceMatch = distance <= maxDistance;
      }

      // Advanced filters (if any)
      let advancedMatch = true;
      if (Object.keys(advancedFilters).length > 0) {
        if (advancedFilters.ageRange) {
          advancedMatch = advancedMatch && user.age >= advancedFilters.ageRange[0] && user.age <= advancedFilters.ageRange[1];
        }
        if (advancedFilters.verified) {
          advancedMatch = advancedMatch && user.verified;
        }
        if (advancedFilters.relationshipType && advancedFilters.relationshipType.length > 0) {
          advancedMatch = advancedMatch && advancedFilters.relationshipType.includes(user.relationshipGoal);
        }
        if (advancedFilters.height) {
          advancedMatch = advancedMatch && user.height >= advancedFilters.height[0] && user.height <= advancedFilters.height[1];
        }
      }

      return ageMatch && relationshipMatch && distanceMatch && advancedMatch;
    });

    setFilteredUsers(filtered);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleLike = async (userId: string) => {
    console.log('Liked user:', userId);
    // Handle like logic
  };

  const handleApplyAdvancedFilters = (filters: FilterPreferences) => {
    setAdvancedFilters(filters);
    setShowAdvancedFilters(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Simple Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Discovery Filters</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Advanced</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Age Range</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={ageRange.min}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, min: parseInt(e.target.value) || 18 }))}
                  className="w-20"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={ageRange.max}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, max: parseInt(e.target.value) || 50 }))}
                  className="w-20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Distance (km)</label>
              <Input
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value) || 50)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Looking For</label>
              <Select value={relationshipGoal} onValueChange={setRelationshipGoal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="serious">Serious relationship</SelectItem>
                  <SelectItem value="casual">Something casual</SelectItem>
                  <SelectItem value="friends">New friends</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-center text-gray-600">
        Found {filteredUsers.length} people near you
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={user.photos[0] || '/placeholder.svg'}
                alt={user.name}
                className="w-full h-64 object-cover"
              />
              {user.verified && (
                <Badge className="absolute top-2 right-2 bg-blue-500">
                  Verified
                </Badge>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-bold text-lg">{user.name}, {user.age}</h3>
                <div className="flex items-center text-white/90 text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {user.location}
                </div>
              </div>
            </div>
            
            <CardContent className="p-4">
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{user.bio}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {user.interests.slice(0, 3).map((interest, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {user.interests.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{user.interests.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedUser(user)}
                  className="flex-1 flex items-center justify-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleLike(user.id)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-pink-500 hover:bg-pink-600"
                >
                  <Heart className="h-4 w-4" />
                  <span>Like</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Modal */}
      {selectedUser && (
        <ProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={() => {}}
          isCurrentUser={false}
        />
      )}

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApplyFilters={handleApplyAdvancedFilters}
        currentFilters={advancedFilters}
      />
    </div>
  );
};

export default DiscoveryGrid;
