import React from 'react';
import { X, MapPin, Briefcase, GraduationCap, Calendar, Heart, Users, Globe } from 'lucide-react';
import { User as UserType } from '@/types/User';
import { AppMode } from '@/types/FriendDateTypes';

interface ProfileDetailCardProps {
  user: UserType;
  mode: AppMode;
  isVisible: boolean;
  onClose: () => void;
}

const ProfileDetailCard = ({ user, mode, isVisible, onClose }: ProfileDetailCardProps) => {
  if (!isVisible) return null;

  const getModeIcon = () => mode === 'friend' ? Users : Heart;
  const ModeIcon = getModeIcon();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="w-full bg-white rounded-t-3xl transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">About {user.name}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                <ModeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{user.name}, {user.age}</h4>
                <p className="text-sm text-gray-600">{user.location}</p>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-700 text-sm leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              {user.job && (
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.job}</span>
                </div>
              )}
              
              {user.education && (
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.education}</span>
                </div>
              )}

              {user.zodiacSign && (
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.zodiacSign}</span>
                </div>
              )}

              {user.languagesSpoken && user.languagesSpoken.length > 0 && (
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.languagesSpoken.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Lifestyle */}
            {(user.drinking || user.smoking || user.exercise) && (
              <div className="space-y-3">
                <h5 className="font-medium text-gray-800">Lifestyle</h5>
                <div className="grid grid-cols-2 gap-2">
                  {user.drinking && (
                    <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm">
                      Drinking: {user.drinking}
                    </div>
                  )}
                  {user.smoking && (
                    <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                      Smoking: {user.smoking}
                    </div>
                  )}
                  {user.exercise && (
                    <div className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm">
                      Exercise: {user.exercise}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium text-gray-800">Interests</h5>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Looking For */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">Looking for</h5>
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3">
                <p className="text-sm text-gray-700">
                  {mode === 'friend' 
                    ? 'New friends and meaningful connections'
                    : 'A genuine relationship and deep connection'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailCard;
