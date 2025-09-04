import React, { useState, useRef } from 'react';
import { X, Camera, Video, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useStories } from '@/hooks/useStories';
import { CreateStoryData } from '@/types/FriendDateTypes';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

const CreateStoryModal = ({ isOpen, onClose, onStoryCreated }: CreateStoryModalProps) => {
  const { createStory, creating } = useStories();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length !== files.length) {
      alert('Please select only image or video files');
      return;
    }

    if (mediaFiles.length + validFiles.length > 5) {
      alert('You can only add up to 5 media files per story');
      return;
    }

    // Add files to state
    setMediaFiles(prev => [...prev, ...validFiles]);

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setMediaPreviews(prev => [...prev, ...newPreviews]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(mediaPreviews[index]);
    
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your story');
      return;
    }

    if (mediaFiles.length === 0) {
      alert('Please add at least one photo or video');
      return;
    }

    const storyData: CreateStoryData = {
      title: title.trim(),
      description: description.trim() || undefined,
      media: mediaFiles
    };

    const success = await createStory(storyData);
    if (success) {
      onStoryCreated();
      handleClose();
    }
  };

  const handleClose = () => {
    // Clean up object URLs
    mediaPreviews.forEach(url => URL.revokeObjectURL(url));
    
    // Reset form
    setTitle('');
    setDescription('');
    setMediaFiles([]);
    setMediaPreviews([]);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Create Story</h2>
            <p className="text-sm text-muted-foreground">Share a moment with your connections</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            disabled={creating}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Story Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your story about?"
              maxLength={100}
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more about this moment..."
              className="resize-none"
              rows={3}
              maxLength={500}
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Photos & Videos *</Label>
            
            {/* Media Grid */}
            <div className="grid grid-cols-3 gap-4">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {mediaFiles[index].type.startsWith('video/') ? (
                      <video
                        src={preview}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={creating}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  
                  {/* Video Indicator */}
                  {mediaFiles[index].type.startsWith('video/') && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </div>
                  )}
                </div>
              ))}
              
              {/* Add Media Button */}
              {mediaFiles.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  disabled={creating}
                >
                  <Plus className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">
                    Add Photo<br/>or Video
                  </span>
                </button>
              )}
            </div>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={creating}
            />

            {/* Guidelines */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Maximum 5 photos/videos per story</p>
              <p>• Videos should be under 30 seconds</p>
              <p>• Stories expire after 48 hours</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={creating || !title.trim() || mediaFiles.length === 0}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Share Story
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryModal;