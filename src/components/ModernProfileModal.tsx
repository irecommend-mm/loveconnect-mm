import React, { useState } from 'react';
import { X, Heart, Star, MapPin, Shield, ChevronLeft, ChevronRight, Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/types/User';

interface ModernProfileModalProps {
  user: User;
  onClose: () => void;
  canEdit?: boolean;
  onSave?: (updatedUser: Partial<User>) => void;
}

const ModernProfileModal = ({ user, onClose, canEdit = false, onSave }: ModernProfileModalProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>(user);

  const nextPhoto = () => {
    if (user.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % user.photos.length);
    }
  };

  const prevPhoto = () => {
    if (user.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + user.photos.length) % user.photos.length);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedUser);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="relative">
          {/* Header */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <Button
              onClick={onClose}
              size="sm"
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border-0 text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </Button>
            
            {canEdit && (
              <Button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                size="sm"
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
            )}
          </div>

          {/* Photo Section */}
          <div className="relative h-96">
            <img
              src={user.photos[currentPhotoIndex]}
              alt={user.name}
              className="w-full h-full object-cover"
            />
            
            {/* Photo Navigation */}
            {user.photos.length > 1 && (
              <>
                <Button
                  onClick={prevPhoto}
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border-0 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={nextPhoto}
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border-0 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {/* Photo Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {user.photos.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              {user.verified && (
                <div className="bg-blue-500 text-white p-1.5 rounded-full">
                  <Shield className="h-3 w-3" />
                </div>
              )}
              {user.isOnline && (
                <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Online</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            {isEditing ? (
              <Input
                value={editedUser.name || ''}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                className="text-2xl font-bold"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">
                {user.name}, {user.age}
              </h2>
            )}
            
            {user.distance && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{Math.round(user.distance)}km away</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">About</h3>
              {isEditing ? (
                <Textarea
                  value={editedUser.bio || ''}
                  onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">{user.bio}</p>
              )}
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Details</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {user.job && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Work:</span>
                  <span className="text-gray-800">{user.job}</span>
                </div>
              )}
              {user.education && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Education:</span>
                  <span className="text-gray-800">{user.education}</span>
                </div>
              )}
              {user.height && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Height:</span>
                  <span className="text-gray-800">{user.height}</span>
                </div>
              )}
              {user.zodiacSign && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Zodiac:</span>
                  <span className="text-gray-800">{user.zodiacSign}</span>
                </div>
              )}
            </div>
          </div>

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-blue-500 hover:bg-blue-600">
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernProfileModal;
