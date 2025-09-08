import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Star, MapPin, Clock, UserCheck, Heart, Coffee, Users, Plane, Dog, Brain, Laptop, Music, Mountain, Palette, Dumbbell, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const OrganizedDiscoveryGrid = () => {
  const navigate = useNavigate();

  const typeCategories = [
    { id: 'nearby', label: 'Nearby', icon: MapPin, color: 'bg-green-500' },
    { id: 'verified', label: 'Verified', icon: Shield, color: 'bg-blue-500' },
    { id: 'popular', label: 'Popular', icon: Star, color: 'bg-yellow-500' },
    { id: 'recent', label: 'Recent', icon: Clock, color: 'bg-purple-500' },
    { id: 'online', label: 'Online', icon: UserCheck, color: 'bg-emerald-500' },
  ];

  const intentCategories = [
    { id: 'serious', label: 'Serious', icon: Heart, color: 'bg-red-500' },
    { id: 'casual', label: 'Casual', icon: Coffee, color: 'bg-orange-500' },
    { id: 'friends', label: 'Friends', icon: Users, color: 'bg-indigo-500' },
    { id: 'unsure', label: 'Unsure', icon: Users, color: 'bg-gray-500' },
  ];

  const interestCategories = [
    { id: 'cafe_lover', label: 'Cafe Lover', icon: Coffee, color: 'bg-amber-600' },
    { id: 'traveller', label: 'Traveller', icon: Plane, color: 'bg-sky-500' },
    { id: 'animal_lover', label: 'Animal Lover', icon: Dog, color: 'bg-green-600' },
    { id: 'mindfulness', label: 'Mindfulness', icon: Brain, color: 'bg-purple-500' },
    { id: 'digital_nomad', label: 'Digital Nomad', icon: Laptop, color: 'bg-blue-600' },
    { id: 'nightlife', label: 'Nightlife', icon: Music, color: 'bg-pink-600' },
    { id: 'adventure', label: 'Adventure', icon: Mountain, color: 'bg-teal-600' },
    { id: 'creative', label: 'Creative', icon: Palette, color: 'bg-rose-500' },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'bg-red-600' },
    { id: 'foodie', label: 'Foodie', icon: UtensilsCrossed, color: 'bg-orange-600' },
  ];

  const renderCategoryGrid = (title: string, categories: any[], onClick: () => void) => (
    <Card className="mb-8 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <span className="text-sm text-muted-foreground">View All →</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.slice(0, 5).map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="flex flex-col items-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className={`${category.color} text-white p-3 rounded-full mb-2`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-center">{category.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover People</h1>
        <p className="text-muted-foreground">Find your perfect match by type, intent, or shared interests</p>
      </div>

      {renderCategoryGrid("Discover by Type", typeCategories, () => navigate('/discover/type'))}
      {renderCategoryGrid("Discover by Intent", intentCategories, () => navigate('/discover/intent'))}
      {renderCategoryGrid("Discover by Interest", interestCategories, () => navigate('/discover/interest'))}
    </div>
  );
};

export default OrganizedDiscoveryGrid;