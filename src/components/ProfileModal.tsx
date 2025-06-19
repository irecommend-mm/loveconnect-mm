
import React, { useState } from 'react';
import { User as UserType } from '../types/User';
import { MapPin, Briefcase, GraduationCap, Heart, Star, Ruler, Calendar } from 'lucide-react';

interface ProfileModalProps {
  user: UserType;
  onClose: () => void;
  isCurrentUser?: boolean;
}

const ProfileModal = ({ user, onClose, isCurrentUser }: ProfileModalProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleNextPhoto = () => {
    if (currentPhotoIndex < user.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const getRelationshipTypeLabel = (type?: string) => {
    switch (type) {
      case 'serious': return 'Looking for something serious';
      case 'casual': return 'Looking for something casual';
      case 'friends': return 'Looking for friends';
      case 'unsure': return 'Not sure what I\'m looking for';
      default: return null;
    }
  };

  const getLifestyleLabel = (key: string, value?: string) => {
    if (!value) return null;
    
    const labels: Record<string, Record<string, string>> = {
      smoking: {
        yes: 'Smoker',
        no: 'Non-smoker',
        sometimes: 'Social smoker'
      },
      drinking: {
        yes: 'Regular drinker',
        no: 'Non-drinker',
        sometimes: 'Social drinker'
      },
      exercise: {
        often: 'Active lifestyle',
        sometimes: 'Sometimes active',
        never: 'Not into fitness'
      },
      children: {
        have: 'Has children',
        want: 'Wants children',
        dont_want: 'Doesn\'t want children',
        unsure: 'Not sure about children'
      }
    };
    
    return labels[key]?.[value] || null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md p-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-xl font-bold">
            {isCurrentUser ? 'Your Profile' : `${user.name}'s Profile`}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Photo Gallery */}
          <div className="relative">
            <img
              src={user.photos[currentPhotoIndex]}
              alt={`${user.name} ${currentPhotoIndex + 1}`}
              className="w-full h-80 object-cover"
            />
            
            {user.verified && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            )}

            {user.photos.length > 1 && (
              <>
                <div className="absolute top-4 left-4 right-4 flex space-x-1">
                  {user.photos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                <div className="absolute inset-0 flex">
                  <div 
                    className="w-1/2 h-full cursor-pointer" 
                    onClick={handlePrevPhoto}
                  />
                  <div 
                    className="w-1/2 h-full cursor-pointer" 
                    onClick={handleNextPhoto}
                  />
                </div>
              </>
            )}
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="text-3xl font-bold">{user.name}</h3>
                <span className="text-2xl text-gray-600">{user.age}</span>
                {user.verified && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
                
                {user.job && (
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{user.job}</span>
                  </div>
                )}
                
                {user.education && (
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>{user.education}</span>
                  </div>
                )}

                {user.height && (
                  <div className="flex items-center space-x-2">
                    <Ruler className="h-4 w-4" />
                    <span>{user.height}</span>
                  </div>
                )}

                {user.zodiacSign && (
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>{user.zodiacSign}</span>
                  </div>
                )}
              </div>
            </div>

            {/* About */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">About {isCurrentUser ? 'Me' : user.name}</h4>
              <p className="text-gray-600 leading-relaxed">{user.bio}</p>
            </div>

            {/* Relationship Goals */}
            {user.relationshipType && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-lg">Looking For</h4>
                <div className="bg-pink-50 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <span className="text-pink-700 font-medium">
                      {getRelationshipTypeLabel(user.relationshipType)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Lifestyle */}
            {(user.smoking || user.drinking || user.exercise || user.children) && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-lg">Lifestyle</h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: 'smoking', value: user.smoking },
                    { key: 'drinking', value: user.drinking },
                    { key: 'exercise', value: user.exercise },
                    { key: 'children', value: user.children }
                  ].map(({ key, value }) => {
                    const label = getLifestyleLabel(key, value);
                    if (!label) return null;
                    
                    return (
                      <div key={key} className="bg-gray-50 rounded-xl p-3">
                        <span className="text-gray-700 text-sm">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interests */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-sm font-medium hover:from-pink-200 hover:to-purple-200 transition-colors"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
