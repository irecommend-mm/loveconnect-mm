
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Clock, Crown } from 'lucide-react';

const WhoVisitedYouPage = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Mock data for demonstration
  const mockVisitors = [
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 28,
      photo: 'https://via.placeholder.com/300x400/FF69B4/FFFFFF?text=Sarah',
      visitedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: '2', 
      name: 'Emma Wilson',
      age: 25,
      photo: 'https://via.placeholder.com/300x400/9932CC/FFFFFF?text=Emma',
      visitedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-bold text-purple-800">
              <Eye className="h-6 w-6 mr-2" />
              Who Visited You
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockVisitors.map((visitor) => (
            <Card key={visitor.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="relative">
                  <img
                    src={visitor.photo}
                    alt={visitor.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {visitor.name}, {visitor.age}
                  </div>
                </div>
                <div className="flex items-center mt-3 text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {Math.floor((Date.now() - visitor.visitedAt.getTime()) / (1000 * 60 * 60))} hours ago
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Premium Upgrade Banner */}
        <Card className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-6 text-center">
            <Crown className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">See Everyone Who Visited You</h3>
            <p className="mb-4">Upgrade to Premium to see all your profile visitors and get more matches!</p>
            <Button 
              onClick={() => setShowUpgradeModal(true)}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhoVisitedYouPage;
