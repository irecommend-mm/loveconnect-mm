import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus, Eye, ArrowLeft, Heart, MapPin, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ProfileData {
  name: string;
  age: number;
  bio: string;
  location: string;
  job: string;
  education: string;
  height: string;
  zodiac_sign: string;
  relationship_type: string;
  children: string;
  smoking: string;
  drinking: string;
  exercise: string;
}

interface ProfileSetupProps {
  onComplete: () => void;
  existingProfile?: ProfileData | null;
}

const ProfileSetup = ({ onComplete, existingProfile }: ProfileSetupProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    age: 18,
    bio: '',
    location: '',
    job: '',
    education: '',
    height: '',
    zodiac_sign: '',
    relationship_type: '',
    children: '',
    smoking: '',
    drinking: '',
    exercise: '',
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Load existing profile data if available
  useEffect(() => {
    if (existingProfile) {
      setProfile({
        name: existingProfile.name || '',
        age: existingProfile.age || 18,
        bio: existingProfile.bio || '',
        location: existingProfile.location || '',
        job: existingProfile.job || '',
        education: existingProfile.education || '',
        height: existingProfile.height || '',
        zodiac_sign: existingProfile.zodiac_sign || '',
        relationship_type: existingProfile.relationship_type || '',
        children: existingProfile.children || '',
        smoking: existingProfile.smoking || '',
        drinking: existingProfile.drinking || '',
        exercise: existingProfile.exercise || '',
      });
    }
  }, [existingProfile]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile({
          name: profileData.name || '',
          age: profileData.age || 18,
          bio: profileData.bio || '',
          location: profileData.location || '',
          job: profileData.job || '',
          education: profileData.education || '',
          height: profileData.height || '',
          zodiac_sign: profileData.zodiac_sign || '',
          relationship_type: profileData.relationship_type || '',
          children: profileData.children || '',
          smoking: profileData.smoking || '',
          drinking: profileData.drinking || '',
          exercise: profileData.exercise || '',
        });
      }

      // Load photos
      const { data: photosData } = await supabase
        .from('photos')
        .select('url')
        .eq('user_id', user.id)
        .order('position');

      if (photosData) {
        setPhotos(photosData.map(photo => photo.url));
      }

      // Load interests
      const { data: interestsData } = await supabase
        .from('interests')
        .select('interest')
        .eq('user_id', user.id);

      if (interestsData) {
        setInterests(interestsData.map(item => item.interest));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Upload Error",
        description: uploadError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    // Save to database
    const { error: dbError } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        url: publicUrl,
        is_primary: photos.length === 0,
        position: photos.length
      });

    if (dbError) {
      toast({
        title: "Database Error",
        description: dbError.message,
        variant: "destructive",
      });
    } else {
      setPhotos([...photos, publicUrl]);
      toast({
        title: "Photo uploaded!",
        description: "Your photo has been added to your profile.",
      });
    }

    setLoading(false);
  };

  const removePhoto = async (photoUrl: string, index: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('user_id', user.id)
      .eq('url', photoUrl);

    if (!error) {
      setPhotos(photos.filter((_, i) => i !== index));
      toast({
        title: "Photo removed",
        description: "Photo has been deleted from your profile.",
      });
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      console.log('Saving profile:', profile);
      
      // Check if profile exists first
      const { data: existingProfileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let profileError;
      
      if (existingProfileData) {
        console.log('Updating existing profile');
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            name: profile.name,
            age: profile.age,
            bio: profile.bio,
            location: profile.location,
            job: profile.job,
            education: profile.education,
            height: profile.height,
            zodiac_sign: profile.zodiac_sign,
            relationship_type: profile.relationship_type,
            children: profile.children,
            smoking: profile.smoking,
            drinking: profile.drinking,
            exercise: profile.exercise,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        profileError = error;
      } else {
        console.log('Creating new profile');
        // Insert new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio,
            location: profile.location,
            job: profile.job,
            education: profile.education,
            height: profile.height,
            zodiac_sign: profile.zodiac_sign,
            relationship_type: profile.relationship_type,
            children: profile.children,
            smoking: profile.smoking,
            drinking: profile.drinking,
            exercise: profile.exercise,
            updated_at: new Date().toISOString(),
          });
        profileError = error;
      }

      if (profileError) {
        console.error('Profile save error:', profileError);
        toast({
          title: "Profile Error",
          description: profileError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('Profile saved successfully');

      // Update interests - delete all first, then insert new ones
      await supabase
        .from('interests')
        .delete()
        .eq('user_id', user.id);

      if (interests.length > 0) {
        const { error: interestsError } = await supabase
          .from('interests')
          .insert(
            interests.map(interest => ({
              user_id: user.id,
              interest,
            }))
          );

        if (interestsError) {
          console.error('Interests save error:', interestsError);
          toast({
            title: "Interests Error",
            description: interestsError.message,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Profile Updated!",
        description: "Your profile has been saved successfully.",
      });

      setLoading(false);
      onComplete();
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Profile Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Profile Preview Component
  const ProfilePreview = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-sm w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="relative">
          <Button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white border-0"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          {photos.length > 0 ? (
            <img
              src={photos[0]}
              alt="Profile"
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No photo uploaded</p>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
            <h2 className="text-2xl font-bold">{profile.name || 'Your Name'}, {profile.age}</h2>
            {profile.location && (
              <div className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{profile.location}</span>
              </div>
            )}
            {profile.job && (
              <div className="flex items-center mt-1">
                <Briefcase className="h-4 w-4 mr-1" />
                <span className="text-sm">{profile.job}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 space-y-4 max-h-60 overflow-y-auto">
          {profile.bio && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}
          
          {interests.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="bg-pink-50 text-pink-700 border-pink-200">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (showPreview) {
    return <ProfilePreview />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <Card className="bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center py-8">
            <CardTitle className="text-2xl font-bold">
              {existingProfile ? 'Update Your Profile' : 'Complete Your Profile'}
            </CardTitle>
            <p className="text-pink-100 mt-2">Make a great first impression</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photos Section */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-800">Your Photos</Label>
                <p className="text-sm text-gray-600">Add at least one photo to continue</p>
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={photo}
                        alt={`Profile ${index + 1}`}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo, index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 6 && (
                    <label className="aspect-square border-2 border-dashed border-pink-300 rounded-2xl flex items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-pink-400 mb-2" />
                        <span className="text-xs text-pink-600 font-medium">Add Photo</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Info - One per row */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-gray-700 font-medium">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={profile.age}
                    onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                    className="h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                    placeholder="Your age"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-700 font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell people about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    rows={4}
                    className="rounded-2xl border-2 border-gray-200 focus:border-pink-400 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-700 font-medium">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    placeholder="City, State"
                    className="h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job" className="text-gray-700 font-medium">Job</Label>
                  <Input
                    id="job"
                    value={profile.job}
                    onChange={(e) => setProfile({...profile, job: e.target.value})}
                    placeholder="Your profession"
                    className="h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education" className="text-gray-700 font-medium">Education</Label>
                  <Input
                    id="education"
                    value={profile.education}
                    onChange={(e) => setProfile({...profile, education: e.target.value})}
                    placeholder="School/University"
                    className="h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-gray-700 font-medium">Height</Label>
                  <Input
                    id="height"
                    value={profile.height}
                    onChange={(e) => setProfile({...profile, height: e.target.value})}
                    placeholder="e.g., 5'8&quot;"
                    className="h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                  />
                </div>
              </div>

              {/* Preferences - One per row */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Preferences</h3>
                
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Looking for</Label>
                  <Select value={profile.relationship_type} onValueChange={(value) => setProfile({...profile, relationship_type: value})}>
                    <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200">
                      <SelectValue placeholder="What are you looking for?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serious">Serious relationship</SelectItem>
                      <SelectItem value="casual">Casual dating</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="unsure">Not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Children</Label>
                  <Select value={profile.children} onValueChange={(value) => setProfile({...profile, children: value})}>
                    <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200">
                      <SelectValue placeholder="Your thoughts on children" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="have">Have kids</SelectItem>
                      <SelectItem value="want">Want kids</SelectItem>
                      <SelectItem value="dont_want">Don&apos;t want kids</SelectItem>
                      <SelectItem value="unsure">Not sure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Smoking</Label>
                  <Select value={profile.smoking} onValueChange={(value) => setProfile({...profile, smoking: value})}>
                    <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200">
                      <SelectValue placeholder="Do you smoke?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="sometimes">Sometimes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Drinking</Label>
                  <Select value={profile.drinking} onValueChange={(value) => setProfile({...profile, drinking: value})}>
                    <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200">
                      <SelectValue placeholder="Do you drink?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="sometimes">Sometimes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Exercise</Label>
                  <Select value={profile.exercise} onValueChange={(value) => setProfile({...profile, exercise: value})}>
                    <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200">
                      <SelectValue placeholder="How often do you exercise?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="often">Often</SelectItem>
                      <SelectItem value="sometimes">Sometimes</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <Label className="text-gray-700 font-medium">Interests</Label>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest"
                    className="h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  />
                  <Button type="button" onClick={addInterest} size="sm" className="h-12 w-12 rounded-2xl bg-pink-500 hover:bg-pink-600">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="cursor-pointer bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100" onClick={() => removeInterest(interest)}>
                      {interest} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  className="w-full h-14 border-2 border-pink-200 text-pink-600 hover:bg-pink-50 font-semibold text-lg rounded-2xl"
                  disabled={photos.length === 0}
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Preview Profile
                </Button>

                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-lg rounded-2xl shadow-lg"
                  disabled={loading || photos.length === 0 || !profile.name.trim()}
                >
                  {loading ? 'Saving...' : (existingProfile ? 'Update Profile' : 'Save Profile')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
