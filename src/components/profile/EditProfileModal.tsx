
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Upload } from 'lucide-react';
import { User as UserType } from '@/types/User';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onSave: (updatedUser: UserType) => void;
}

export const EditProfileModal = ({ isOpen, onClose, user, onSave }: EditProfileModalProps) => {
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name,
    age: user.age,
    bio: user.bio,
    job: user.job || '',
    education: user.education || '',
    location: user.location,
    height: user.height || '',
    relationshipType: user.relationshipType || 'serious',
    interests: user.interests || [],
  });
  const [newInterest, setNewInterest] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      handleInputChange('interests', [...formData.interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    handleInputChange('interests', formData.interests.filter(i => i !== interest));
  };

  const handleSave = async () => {
    if (!authUser) return;

    setSaving(true);
    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          age: formData.age,
          bio: formData.bio,
          job_title: formData.job,
          education: formData.education,
          location: formData.location,
          height: formData.height,
          relationship_type: formData.relationshipType,
          lifestyle: {
            interests: formData.interests,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', authUser.id);

      if (profileError) throw profileError;

      // Update interests table
      await supabase
        .from('interests')
        .delete()
        .eq('user_id', authUser.id);

      if (formData.interests.length > 0) {
        const { error: interestsError } = await supabase
          .from('interests')
          .insert(formData.interests.map(interest => ({
            user_id: authUser.id,
            interest,
          })));

        if (interestsError) throw interestsError;
      }

      // Create updated user object
      const updatedUser: UserType = {
        ...user,
        name: formData.name,
        age: formData.age,
        bio: formData.bio,
        job: formData.job,
        education: formData.education,
        location: formData.location,
        height: formData.height,
        relationshipType: formData.relationshipType as 'serious' | 'casual' | 'friends' | 'unsure',
        interests: formData.interests,
      };

      onSave(updatedUser);
      onClose();

      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Unable to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Edit Profile</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                placeholder="Your age"
                min="18"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Your location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="e.g., 5'8&quot;"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell others about yourself..."
              className="min-h-[100px]"
            />
          </div>

          {/* Work & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job">Job Title</Label>
              <Input
                id="job"
                value={formData.job}
                onChange={(e) => handleInputChange('job', e.target.value)}
                placeholder="Your job title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="Your education"
              />
            </div>
          </div>

          {/* Relationship Type */}
          <div className="space-y-2">
            <Label>Looking For</Label>
            <Select 
              value={formData.relationshipType} 
              onValueChange={(value) => handleInputChange('relationshipType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serious">Serious Relationship</SelectItem>
                <SelectItem value="casual">Casual Dating</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="unsure">Not Sure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{interest}</span>
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest"
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
              />
              <Button onClick={handleAddInterest} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Changes'}
              <Save className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
