
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Camera } from 'lucide-react';

interface PhotoGalleryProps {
  photos: string[];
  isOwner?: boolean;
  onAddPhoto?: () => void;
  onRemovePhoto?: (index: number) => void;
  maxPhotos?: number;
}

const PhotoGallery = ({ 
  photos, 
  isOwner = false, 
  onAddPhoto, 
  onRemovePhoto, 
  maxPhotos = 6 
}: PhotoGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToPhoto = (index: number) => {
    setCurrentIndex(index);
  };

  if (!photos.length && !isOwner) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Main Photo Display */}
      <div className="relative h-96 rounded-2xl overflow-hidden bg-gray-100">
        {photos.length > 0 ? (
          <>
            <img
              src={photos[currentIndex]}
              alt={`Photo ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                
                <button
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
              </>
            )}

            {/* Remove Photo Button (Owner Only) */}
            {isOwner && onRemovePhoto && (
              <button
                onClick={() => onRemovePhoto(currentIndex)}
                className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-4">Add your first photo</p>
              {isOwner && onAddPhoto && (
                <button
                  onClick={onAddPhoto}
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Add Photo
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Photo Dots Indicator */}
      {photos.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPhoto(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-pink-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Photo Grid (Owner View) */}
      {isOwner && (
        <div className="mt-6">
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className={`w-full h-24 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                    index === currentIndex 
                      ? 'border-pink-500 opacity-100' 
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => goToPhoto(index)}
                />
              </div>
            ))}
            
            {/* Add Photo Button */}
            {photos.length < maxPhotos && onAddPhoto && (
              <button
                onClick={onAddPhoto}
                className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-colors group"
              >
                <Plus className="h-6 w-6 text-gray-400 group-hover:text-pink-500" />
              </button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            {photos.length}/{maxPhotos} photos • Tap to reorder
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
