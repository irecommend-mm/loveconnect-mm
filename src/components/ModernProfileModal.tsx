
import React, { useState } from 'react';
import { User as UserType } from '../types/User';
import { MapPin, Briefcase, GraduationCap, Heart, Star, Ruler, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ModernProfileModalProps {
  user: UserType;
  onClose: () => void;
  onLike?: () => void;
  onPass?: () => void;
  onSuperLike?: () => void;
  showActions?: boolean;
}

const ModernProfileModal = ({ user, onClose, onLike, onPass, onSuperLike, showActions = true }: ModernProfileModalProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    if (currentPhotoIndex < user.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
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
      smoking: { yes: 'Smoker', no: 'Non-smoker', sometimes: 'Social smoker' },
      drinking: { yes: 'Regular drinker', no: 'Non-drinker', sometimes: 'Social drinker' },
      exercise: { often: 'Active lifestyle', sometimes: 'Sometimes active', never: 'Not into fitness' },
      children: { have: 'Has children', want: 'Wants children', dont_want: 'Doesn\'t want children', unsure: 'Not sure about children' }
    };
    
    return labels[key]?.[value] || null;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          
          {/* Photo Gallery */}
          <div className="relative h-96">
            <img
              src={user.photos[currentPhotoIndex]}
              alt={`${user.name} ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {user.verified && (
              <div className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded-full">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            )}

            {/* Photo Navigation */}
            {user.photos.length > 1 && (
              <>
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                  <button
                    onClick={prevPhoto}
                    disabled={currentPhotoIndex === 0}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                </div>
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                  <button
                    onClick={nextPhoto}
                    disabled={currentPhotoIndex === user.photos.length - 1}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                </div>
                
                {/* Photo Dots */}
                <div className="absolute bottom-4 left-4 right-4 flex space-x-1">
                  {user.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`h-2 rounded-full flex-1 transition-all duration-300 ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
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
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">About {user.name}</h3>
            <p className="text-gray-700 leading-relaxed">{user.bio}</p>
          </div>

          {/* Relationship Goals */}
          {user.relationshipType && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Looking For</h3>
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

          {/* Interests */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-0 hover:from-pink-200 hover:to-purple-200"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Lifestyle */}
          {(user.smoking || user.drinking || user.exercise || user.children) && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Lifestyle</h3>
              <div className="grid gap-2">
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
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="p-6 border-t border-gray-100">
            <div className="flex justify-center items-center space-x-4">
              <Button
                onClick={onPass}
                size="lg"
                variant="outline"
                className="rounded-full w-14 h-14 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <X className="h-6 w-6 text-red-500" />
              </Button>

              <Button
                onClick={onSuperLike}
                size="lg"
                className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Star className="h-6 w-6 text-white fill-current" />
              </Button>

              <Button
                onClick={onLike}
                size="lg"
                className="rounded-full w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
              >
                <Heart className="h-8 w-8 text-white fill-current" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernProfileModal;
