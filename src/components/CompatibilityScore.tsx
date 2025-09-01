
import React from 'react';
import { Heart, Users, Star, Sparkles } from 'lucide-react';
import { CompatibilityScore as CompatibilityScoreType, AppMode } from '@/types/FriendDateTypes';

interface CompatibilityScoreProps {
  score: CompatibilityScoreType;
  mode: AppMode;
  userName: string;
}

const CompatibilityScore = ({ score, mode, userName }: CompatibilityScoreProps) => {
  const displayScore = mode === 'friend' ? score.friendshipScore : score.romanceScore;
  const icon = mode === 'friend' ? Users : Heart;
  const color = mode === 'friend' ? 'blue' : 'pink';
  
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 55) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getScoreText = (score: number) => {
    if (score >= 85) return 'Excellent Match!';
    if (score >= 70) return 'Great Compatibility';
    if (score >= 55) return 'Good Potential';
    return 'Mixed Compatibility';
  };

  const Icon = icon;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full bg-${color}-100`}>
            <Icon className={`h-4 w-4 text-${color}-600`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {mode === 'friend' ? 'Friendship' : 'Romance'} Match
            </h3>
            <p className="text-xs text-gray-500">with {userName}</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full ${getScoreColor(displayScore)}`}>
          <span className="font-bold text-lg">{displayScore}%</span>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">
          {getScoreText(displayScore)}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              displayScore >= 85 ? 'bg-green-500' :
              displayScore >= 70 ? 'bg-blue-500' :
              displayScore >= 55 ? 'bg-yellow-500' : 'bg-gray-400'
            }`}
            style={{ width: `${displayScore}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">Common Interests</span>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 ${
                  i < Math.floor(score.factors.commonInterests / 20) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">Lifestyle Alignment</span>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 ${
                  i < Math.floor(score.factors.lifestyleAlignment / 20) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
        </div>

        {score.factors.zodiacCompatibility && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              Zodiac Match
            </span>
            <span className="text-purple-600 font-medium">
              {score.factors.zodiacCompatibility}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompatibilityScore;
