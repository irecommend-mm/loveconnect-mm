
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface VisitorProfile {
  id: string;
  name: string;
  age: number;
  photo: string;
  visitedAt: Date;
  isBlurred: boolean;
}

interface WhoVisitedYouPageProps {
  onShowPremium: () => void;
}

const WhoVisitedYouPage = ({ onShowPremium }: WhoVisitedYouPageProps) => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<VisitorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    if (!user) return;

    try {
      // For demo purposes, create some mock visitors
      // In a real app, you'd fetch actual visitor data from your database
      const mockVisitors: VisitorProfile[] = [
        {
          id: '1',
          name: 'Sarah',
          age: 28,
          photo: '/placeholder.svg',
          visitedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          isBlurred: true
        },
        {
          id: '2',
          name: 'Emily',
          age: 25,
          photo: '/placeholder.svg',
          visitedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          isBlurred: true
        },
        {
          id: '3',
          name: 'Jessica',
          age: 30,
          photo: '/placeholder.svg',
          visitedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          isBlurred: true
        }
      ];

      setVisitors(mockVisitors);
    } catch (error) {
      console.error('Error loading visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Who Visited You</h2>
        <p className="text-gray-600">See who's been checking out your profile</p>
      </div>

      {/* Premium Upgrade Banner */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
        <CardContent className="p-6 text-center">
          <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
          <h3 className="text-xl font-bold mb-2">Unlock Profile Visitors</h3>
          <p className="mb-4 opacity-90">
            See exactly who visited your profile and when they visited
          </p>
          <Button
            onClick={onShowPremium}
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>

      {/* Visitors Grid */}
      <div className="grid grid-cols-2 gap-4">
        {visitors.map((visitor) => (
          <Card
            key={visitor.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={onShowPremium}
          >
            <CardContent className="p-4">
              <div className="relative">
                <div className="aspect-square rounded-lg overflow-hidden mb-3">
                  <img
                    src={visitor.photo}
                    alt={visitor.name}
                    className={`w-full h-full object-cover ${
                      visitor.isBlurred ? 'filter blur-md' : ''
                    }`}
                  />
                  {visitor.isBlurred && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-800">{visitor.name}</h4>
                  <p className="text-sm text-gray-600">Age {visitor.age}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {formatTimeAgo(visitor.visitedAt)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {visitors.length === 0 && (
        <div className="text-center py-12">
          <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No visitors yet</h3>
          <p className="text-gray-500">When people visit your profile, they'll appear here</p>
        </div>
      )}
    </div>
  );
};

export default WhoVisitedYouPage;
