
import React from 'react';
import { User as UserType } from '../types/User';

interface ProfileModalProps {
  user: UserType;
  onClose: () => void;
  isCurrentUser?: boolean;
}

const ProfileModal = ({ user, onClose, isCurrentUser }: ProfileModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
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

          {/* Photos */}
          <div className="p-4 space-y-4">
            {user.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`${user.name} ${index + 1}`}
                className="w-full h-64 object-cover rounded-2xl"
              />
            ))}
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{user.name}, {user.age}</h3>
              <p className="text-gray-600">{user.location}</p>
            </div>

            {user.job && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Job</h4>
                <p className="text-gray-600">{user.job}</p>
              </div>
            )}

            {user.education && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Education</h4>
                <p className="text-gray-600">{user.education}</p>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">About</h4>
              <p className="text-gray-600 leading-relaxed">{user.bio}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-sm font-medium"
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
