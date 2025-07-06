
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Clock, Users, TrendingUp } from 'lucide-react';

interface BoostProfileProps {
  onClose: () => void;
  onBoost: (duration: number) => void;
}

const BoostProfile = ({ onClose, onBoost }: BoostProfileProps) => {
  const [selectedBoost, setSelectedBoost] = useState<number | null>(null);

  const boostOptions = [
    {
      duration: 30,
      title: '30 Minutes Boost',
      description: 'Be a top profile in your area for 30 minutes',
      price: '$4.99',
      popular: false
    },
    {
      duration: 60,
      title: '1 Hour Boost',
      description: 'Be a top profile in your area for 1 hour',
      price: '$7.99',
      popular: true
    },
    {
      duration: 180,
      title: '3 Hours Boost',
      description: 'Be a top profile in your area for 3 hours',
      price: '$19.99',
      popular: false
    }
  ];

  const handleBoost = () => {
    if (selectedBoost) {
      onBoost(selectedBoost);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Boost Your Profile</CardTitle>
          <p className="text-gray-600">Get up to 10x more matches by being seen by more people</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {boostOptions.map((option) => (
            <div
              key={option.duration}
              className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedBoost === option.duration
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => setSelectedBoost(option.duration)}
            >
              {option.popular && (
                <div className="absolute -top-2 left-4 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Most Popular
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{option.title}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{option.price}</div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-blue-800">Boost Benefits</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be one of the top profiles in your area</li>
              <li>• Get up to 10x more profile views</li>
              <li>• Increase your chances of getting matches</li>
              <li>• See results immediately</li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={handleBoost}
              disabled={!selectedBoost}
            >
              Boost Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoostProfile;
