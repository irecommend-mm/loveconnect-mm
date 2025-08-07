
import React from 'react';
import { useGamification } from '@/hooks/useGamification';
import { Zap, Target, Calendar, Trophy } from 'lucide-react';

export const GamificationStatus = () => {
  const { gamificationData, getActivityLevelDisplay } = useGamification();

  if (!gamificationData) {
    return null;
  }

  const activityDisplay = getActivityLevelDisplay(gamificationData.activityLevel);

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Your Activity</h3>
        <div className="flex items-center space-x-1 text-sm">
          <span className={activityDisplay.color}>{activityDisplay.emoji}</span>
          <span className={`font-medium ${activityDisplay.color}`}>
            {activityDisplay.label}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <div>
            <div className="text-lg font-bold text-gray-800">{gamificationData.totalScore}</div>
            <div className="text-xs text-gray-600">Total Score</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-green-500" />
          <div>
            <div className="text-lg font-bold text-gray-800">{gamificationData.dailyStreak}</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-blue-500" />
          <div>
            <div className="text-lg font-bold text-gray-800">{gamificationData.profileCompletenessScore}%</div>
            <div className="text-xs text-gray-600">Profile Complete</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-orange-500" />
          <div>
            <div className="text-lg font-bold text-gray-800">{gamificationData.engagementScore}</div>
            <div className="text-xs text-gray-600">Engagement</div>
          </div>
        </div>
      </div>
    </div>
  );
};
