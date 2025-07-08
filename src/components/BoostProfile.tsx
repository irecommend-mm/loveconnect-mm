
import React, { useState } from 'react';
import { Zap, Crown, Users, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface BoostProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onBoost: (boostType: 'standard' | 'premium' | 'super') => void;
}

const BoostProfile = ({ isOpen, onClose, onBoost }: BoostProfileProps) => {
  const [selectedBoost, setSelectedBoost] = useState<'standard' | 'premium' | 'super'>('standard');
  const [isBoosting, setIsBoosting] = useState(false);

  const boostOptions = [
    {
      id: 'standard' as const,
      name: 'Standard Boost',
      duration: '30 minutes',
      multiplier: '5x',
      price: '$2.99',
      description: '5x more profile views for 30 minutes',
      icon: Zap,
      color: 'from-blue-500 to-purple-600',
      popular: false,
    },
    {
      id: 'premium' as const,
      name: 'Premium Boost',
      duration: '1 hour',
      multiplier: '10x',
      price: '$4.99',
      description: '10x more profile views for 1 hour',
      icon: Crown,
      color: 'from-purple-500 to-pink-600',
      popular: true,
    },
    {
      id: 'super' as const,
      name: 'Super Boost',
      duration: '3 hours',
      multiplier: '20x',
      price: '$9.99',
      description: '20x more profile views for 3 hours',
      icon: Zap,
      color: 'from-pink-500 to-red-600',
      popular: false,
    },
  ];

  const handleBoost = async () => {
    setIsBoosting(true);
    
    // Simulate boost activation
    setTimeout(() => {
      onBoost(selectedBoost);
      setIsBoosting(false);
      
      const selectedOption = boostOptions.find(opt => opt.id === selectedBoost);
      toast({
        title: "Boost Activated! 🚀",
        description: `Your profile will get ${selectedOption?.multiplier} more views for ${selectedOption?.duration}`,
      });
      
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Boost Your Profile</h2>
              <p className="text-sm text-gray-500">Get more matches today</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {boostOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedBoost === option.id
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedBoost(option.id)}
              >
                {option.popular && (
                  <Badge className="absolute -top-2 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                    Most Popular
                  </Badge>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-gradient-to-r ${option.color} rounded-full`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{option.name}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          <span>{option.multiplier} views</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{option.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{option.price}</div>
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center mt-1">
                      {selectedBoost === option.id && (
                        <div className="w-2 h-2 bg-pink-500 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            onClick={handleBoost}
            disabled={isBoosting}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-2xl"
          >
            {isBoosting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Activating Boost...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Activate Boost</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BoostProfile;
