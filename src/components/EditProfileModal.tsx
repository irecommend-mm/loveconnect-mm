import React, { useState } from 'react';
import { User as UserType } from '@/types/User';
import { X, Save, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EditProfileModalProps {
  user: UserType;
  onClose: () => void;
  onSave: (updatedUser: UserType) => void;
}

const EditProfileModal = ({ user, onClose, onSave }: EditProfileModalProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>(user.photos || ['', '', '', '']);
  const [profile, setProfile] = useState({
    name: user.name || '',
    age: user.age || 18,
    bio: user.bio || '',
    location: user.location || '',
    job: user.job || '',
    company: user.company || '',
    education: user.education || '',
    height: user.height || '',
    zodiacSign: user.zodiacSign || '',
    relationshipType: user.relationshipType || '',
    children: user.children || '',
    smoking: user.smoking || '',
    drinking: user.drinking || '',
    exercise: user.exercise || '',
    religion: user.religion || '',
    gender: user.gender || '',
    orientation: user.orientation || [],
    showMe: user.showMe || [],
    loveLanguages: user.loveLanguages || [],
    personalityType: user.personalityType || '',
    bodyType: user.bodyType || '',
    languagesSpoken: user.languagesSpoken || [],
    dealbreakers: user.dealbreakers || [],
    interests: user.interests || [],
    ageRange: [18, 50],
    maxDistance: 50
  });

  const handlePhotoUpload = async (index: number, file: File) => {
    if (!file) return;
    
    try {
      setUploadingIndex(index);
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${index}_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update photos array
      const newPhotos = [...photos];
      newPhotos[index] = publicUrl;
      setPhotos(newPhotos);

      toast({
        title: "Photo uploaded successfully!",
        description: "Your photo has been updated.",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      console.log('Updating profile for user:', user.id);
      console.log('Profile data to update:', profile);

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          age: profile.age,
          bio: profile.bio,
          location: profile.location,
          job: profile.job,
          company: profile.company,
          education: profile.education,
          height: profile.height,
          zodiac_sign: profile.zodiacSign,
          relationship_type: profile.relationshipType,
          children: profile.children,
          smoking: profile.smoking,
          drinking: profile.drinking,
          exercise: profile.exercise,
          religion: profile.religion,
          gender: profile.gender,
          orientation: profile.orientation,
          show_me: profile.showMe,
          love_languages: profile.loveLanguages,
          personality_type: profile.personalityType,
          body_type: profile.bodyType,
          languages_spoken: profile.languagesSpoken,
          dealbreakers: profile.dealbreakers,
          lifestyle: {
            interests: profile.interests
          },
          preferences: {
            age_range: profile.ageRange,
            max_distance: profile.maxDistance
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase profile update error:', error);
        throw error;
      }

      // Update photos if changed
      if (JSON.stringify(photos) !== JSON.stringify(user.photos)) {
        // Delete old photos from storage
        if (user.photos) {
          for (const photoUrl of user.photos) {
            if (photoUrl && photoUrl.includes('profile-photos/')) {
              const fileName = photoUrl.split('/').pop();
              if (fileName) {
                try {
                  await supabase.storage
                    .from('profile-photos')
                    .remove([fileName]);
                } catch (storageError) {
                  console.warn('Could not delete old photo from storage:', storageError);
                }
              }
            }
          }
        }

        // Update photos in database
        const { error: photoError } = await supabase
          .from('photos')
          .upsert(
            photos.filter(photo => photo).map((photo, index) => ({
              user_id: user.id,
              url: photo,
              position: index
            }))
          );

        if (photoError) {
          console.error('Supabase photo update error:', photoError);
          throw photoError;
        }
      }

      // Create updated user object
      const updatedUser: UserType = {
        ...user,
        ...profile,
        relationshipType: profile.relationshipType as 'serious' | 'casual' | 'friends' | 'unsure',
        children: profile.children as 'have' | 'want' | 'dont_want' | 'unsure',
        smoking: profile.smoking as 'yes' | 'no' | 'sometimes',
        drinking: profile.drinking as 'yes' | 'no' | 'sometimes',
        exercise: profile.exercise as 'often' | 'sometimes' | 'never',
        photos: photos.filter(photo => photo)
      };

      onSave(updatedUser);
      
      toast({
        title: "Profile updated successfully!",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = '';
    setPhotos(newPhotos);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md p-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </Button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 p-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 18 })}
                      min="18"
                      max="100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <Label htmlFor="job">Job Title</Label>
                    <Input
                      id="job"
                      value={profile.job}
                      onChange={(e) => setProfile({ ...profile, job: e.target.value })}
                      placeholder="Your job title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      placeholder="Your company"
                    />
                  </div>

                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      value={profile.education}
                      onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                      placeholder="Your education"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={profile.height}
                      onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                      placeholder="e.g., 5'9&quot; or 175cm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="zodiacSign">Zodiac Sign</Label>
                    <Select value={profile.zodiacSign} onValueChange={(value) => setProfile({ ...profile, zodiacSign: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select zodiac sign" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map((sign) => (
                          <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="relationshipType">Looking For</Label>
                    <Select value={profile.relationshipType} onValueChange={(value) => setProfile({ ...profile, relationshipType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="What are you looking for?" />
                      </SelectTrigger>
                      <SelectContent>
                        {['serious', 'casual', 'friends', 'unsure'].map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === 'serious' ? 'Something serious' : 
                             type === 'casual' ? 'Something casual' : 
                             type === 'friends' ? 'Friends' : 'Not sure'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bio">About Me</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="photos" className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {photo ? (
                        <div className="relative w-full h-full">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-xs text-gray-500">Add Photo</p>
                        </div>
                      )}
                    </div>
                    
                    <input
                      type="file"
                      id={`photo-${index}`}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(index, file);
                      }}
                      className="hidden"
                    />
                    
                    <label
                      htmlFor={`photo-${index}`}
                      className="absolute inset-0 cursor-pointer"
                    />
                    
                    {uploadingIndex === index && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="lifestyle" className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="smoking">Smoking</Label>
                    <Select value={profile.smoking} onValueChange={(value) => setProfile({ ...profile, smoking: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select smoking preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {['yes', 'no', 'sometimes'].map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === 'yes' ? 'Yes' : option === 'no' ? 'No' : 'Sometimes'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="drinking">Drinking</Label>
                    <Select value={profile.drinking} onValueChange={(value) => setProfile({ ...profile, drinking: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select drinking preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {['yes', 'no', 'sometimes'].map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === 'yes' ? 'Yes' : option === 'no' ? 'No' : 'Sometimes'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="exercise">Exercise</Label>
                    <Select value={profile.exercise} onValueChange={(value) => setProfile({ ...profile, exercise: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {['often', 'sometimes', 'never'].map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === 'often' ? 'Often' : option === 'sometimes' ? 'Sometimes' : 'Never'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="children">Children</Label>
                    <Select value={profile.children} onValueChange={(value) => setProfile({ ...profile, children: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select children preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {['have', 'want', 'dont_want', 'unsure'].map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === 'have' ? 'Have children' : 
                             option === 'want' ? 'Want children' : 
                             option === 'dont_want' ? 'Don\'t want children' : 'Not sure'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Interests</Label>
                    <div className="space-y-2">
                      {['Reading', 'Travel', 'Music', 'Sports', 'Cooking', 'Art', 'Gaming', 'Fitness', 'Photography', 'Dancing'].map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox
                            id={interest}
                            checked={profile.interests.includes(interest)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setProfile({
                                  ...profile,
                                  interests: [...profile.interests, interest]
                                });
                              } else {
                                setProfile({
                                  ...profile,
                                  interests: profile.interests.filter(i => i !== interest)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={interest} className="text-sm">{interest}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="p-6 space-y-6">
              <div className="space-y-6">
                <div>
                  <Label>Age Range: {profile.ageRange[0]} - {profile.ageRange[1]} years</Label>
                  <Slider
                    value={profile.ageRange}
                    onValueChange={(value) => setProfile({ ...profile, ageRange: value as [number, number] })}
                    max={70}
                    min={18}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label>Maximum Distance: {profile.maxDistance} km</Label>
                  <Slider
                    value={[profile.maxDistance]}
                    onValueChange={(value) => setProfile({ ...profile, maxDistance: value[0] })}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
