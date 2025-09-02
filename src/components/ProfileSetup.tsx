import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Plus, Eye, ArrowLeft, Heart, MapPin, Briefcase, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { SocialIntegrationPanel } from './social/SocialIntegrationPanel';
import { ProfileData, ExistingProfile } from '@/types/FriendDateTypes';



interface ProfileSetupProps {
  onComplete: () => void;
  existingProfile?: ExistingProfile;
}

const ProfileSetup = ({ onComplete, existingProfile }: ProfileSetupProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>(['', '', '', '']);
  const [showPreview, setShowPreview] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    age: 18,
    birthdate: '',
    bio: '',
    location: '',
    job_title: '',
    company_name: '',
    education: '',
    education_level: '',
    height_cm: 170,
    zodiac_sign: '',
    relationship_type: '',
    children: '',
    smoking: '',
    drinking: '',
    exercise: '',
    religion: '',
    gender: '',
    orientation: [],
    show_me: [],
    love_languages: [],
    personality_type: '',
    body_type: '',
    languages_spoken: [],
    dealbreakers: [],
    lifestyle: {
      interests: []
    },
    preferences: {
      age_range: [18, 50],
      max_distance: 50
    },
    terms_agreement: false,
    video_intro_url: '',
    instagram_username: '',
    spotify_connected: false,
    spotify_data: {},
    voice_intro_url: '',
    facebook_id: '',
    social_verified: false
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  useEffect(() => {
    if (existingProfile) {
      // Helper function to safely parse JSON data
      const parseJsonField = (field: unknown, defaultValue: unknown) => {
        if (field && typeof field === 'object') {
          return field;
        }
        return defaultValue;
      };

      const parsedLifestyle = parseJsonField(existingProfile.lifestyle, { interests: [] });
      const parsedPreferences = parseJsonField(existingProfile.preferences, { age_range: [18, 50], max_distance: 50 });

      setProfile({
        name: existingProfile.name || '',
        age: existingProfile.age || 18,
        birthdate: existingProfile.birthdate || '',
        bio: existingProfile.bio || '',
        location: existingProfile.location || '',
        job_title: existingProfile.job_title || '',
        company_name: existingProfile.company_name || '',
        education: existingProfile.education || '',
        education_level: existingProfile.education_level || '',
        height_cm: existingProfile.height_cm || 170,
        zodiac_sign: existingProfile.zodiac_sign || '',
        relationship_type: existingProfile.relationship_type || '',
        children: existingProfile.children || '',
        smoking: existingProfile.smoking || '',
        drinking: existingProfile.drinking || '',
        exercise: existingProfile.exercise || '',
        religion: existingProfile.religion || '',
        gender: existingProfile.gender || '',
        orientation: existingProfile.orientation || [],
        show_me: existingProfile.show_me || [],
        love_languages: existingProfile.love_languages || [],
        personality_type: existingProfile.personality_type || '',
        body_type: existingProfile.body_type || '',
        languages_spoken: existingProfile.languages_spoken || [],
        dealbreakers: existingProfile.dealbreakers || [],
        lifestyle: {
          interests: parsedLifestyle.interests || [],
          ...parsedLifestyle
        },
        preferences: {
          age_range: parsedPreferences.age_range || [18, 50],
          max_distance: parsedPreferences.max_distance || 50,
          ...parsedPreferences
        },
        terms_agreement: existingProfile.terms_agreement || false,
        video_intro_url: existingProfile.video_intro_url || '',
        instagram_username: existingProfile.instagram_username || '',
        spotify_connected: existingProfile.spotify_connected || false,
        spotify_data: existingProfile.spotify_data || {},
        voice_intro_url: existingProfile.voice_intro_url || '',
        facebook_id: existingProfile.facebook_id || '',
        social_verified: existingProfile.social_verified || false
      });
    }
  }, [existingProfile]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        // Helper function to safely parse JSON data
        const parseJsonField = (field: unknown, defaultValue: unknown) => {
          if (field && typeof field === 'object') {
            return field;
          }
          return defaultValue;
        };

        const parsedLifestyle = parseJsonField(profileData.lifestyle, { interests: [] });
        const parsedPreferences = parseJsonField(profileData.preferences, { age_range: [18, 50], max_distance: 50 });

        setProfile({
          name: profileData.name || '',
          age: profileData.age || 18,
          birthdate: profileData.birthdate || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          job_title: profileData.job_title || '',
          company_name: profileData.company_name || '',
          education: profileData.education || '',
          education_level: profileData.education_level || '',
          height_cm: profileData.height_cm || 170,
          zodiac_sign: profileData.zodiac_sign || '',
          relationship_type: profileData.relationship_type || '',
          children: profileData.children || '',
          smoking: profileData.smoking || '',
          drinking: profileData.drinking || '',
          exercise: profileData.exercise || '',
          religion: profileData.religion || '',
          gender: profileData.gender || '',
          orientation: profileData.orientation || [],
          show_me: profileData.show_me || [],
          love_languages: profileData.love_languages || [],
          personality_type: profileData.personality_type || '',
          body_type: profileData.body_type || '',
          languages_spoken: profileData.languages_spoken || [],
          dealbreakers: profileData.dealbreakers || [],
          lifestyle: {
            interests: parsedLifestyle.interests || [],
            ...parsedLifestyle
          },
          preferences: {
            age_range: parsedPreferences.age_range || [18, 50],
            max_distance: parsedPreferences.max_distance || 50,
            ...parsedPreferences
          },
          terms_agreement: profileData.terms_agreement || false,
          video_intro_url: profileData.video_intro_url || '',
          instagram_username: profileData.instagram_username || '',
          spotify_connected: profileData.spotify_connected || false,
          spotify_data: profileData.spotify_data || {},
          voice_intro_url: profileData.voice_intro_url || '',
          facebook_id: profileData.facebook_id || '',
          social_verified: profileData.social_verified || false
        });
      }

      const { data: photosData } = await supabase
        .from('photos')
        .select('url')
        .eq('user_id', user.id)
        .order('position');

      if (photosData) {
        setPhotos(photosData.map(photo => photo.url));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingIndex(slotIndex);
    console.log('Starting photo upload for slot:', slotIndex);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log('Uploading file:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload Error",
          description: uploadError.message,
          variant: "destructive",
        });
        setUploadingIndex(null);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      console.log('File uploaded, public URL:', publicUrl);

      // Check if photo already exists at this position
      const { data: existingPhoto } = await supabase
        .from('photos')
        .select('id')
        .eq('user_id', user.id)
        .eq('position', slotIndex)
        .single();

      let dbError;
      if (existingPhoto) {
        // Update existing photo
        const { error } = await supabase
          .from('photos')
          .update({
            url: publicUrl,
            is_primary: slotIndex === 0
          })
          .eq('user_id', user.id)
          .eq('position', slotIndex);
        dbError = error;
      } else {
        // Insert new photo
        const { error } = await supabase
          .from('photos')
          .insert({
            user_id: user.id,
            url: publicUrl,
            is_primary: slotIndex === 0,
            position: slotIndex
          });
        dbError = error;
      }

      if (dbError) {
        console.error('Database error:', dbError);
        toast({
          title: "Database Error",
          description: dbError.message,
          variant: "destructive",
        });
      } else {
        // Update local state
        const newPhotos = [...photos];
        newPhotos[slotIndex] = publicUrl;
        setPhotos(newPhotos);
        
        console.log('Photo saved successfully, updated photos:', newPhotos);
        
        toast({
          title: "Photo uploaded!",
          description: "Your photo has been added to your profile.",
        });
      }
    } catch (error) {
      console.error('Unexpected error during upload:', error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    }

    setUploadingIndex(null);
    // Reset the input
    event.target.value = '';
  };

  const removePhoto = async (photoUrl: string, index: number) => {
    if (!user) return;

    console.log('Removing photo at index:', index, 'URL:', photoUrl);

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('user_id', user.id)
        .eq('url', photoUrl);

      if (!error) {
        const newPhotos = [...photos];
        newPhotos[index] = '';
        setPhotos(newPhotos);
        
        console.log('Photo removed successfully, updated photos:', newPhotos);
        
        toast({
          title: "Photo removed",
          description: "Photo has been deleted from your profile.",
        });
      } else {
        console.error('Error removing photo:', error);
      }
    } catch (error) {
      console.error('Unexpected error removing photo:', error);
    }
  };

  const toggleArrayValue = (array: string[], value: string, field: keyof ProfileData) => {
    const newArray = array.includes(value) 
      ? array.filter(item => item !== value)
      : [...array, value];
    setProfile(prev => ({ ...prev, [field]: newArray }));
  };

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return profile.age;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Check if at least one photo is uploaded
    const hasPhotos = photos.some(photo => photo && photo.trim() !== '');
    if (!hasPhotos) {
      toast({
        title: "Photo Required",
        description: "Please upload at least one photo to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const calculatedAge = calculateAge(profile.birthdate);
      
      const profileData = {
        user_id: user.id,
        name: profile.name,
        age: calculatedAge,
        birthdate: profile.birthdate || null,
        bio: profile.bio,
        location: profile.location,
        job_title: profile.job_title,
        company_name: profile.company_name,
        education: profile.education,
        education_level: profile.education_level,
        height_cm: profile.height_cm,
        height_feet: profile.height_cm * 0.0328084,
        zodiac_sign: profile.zodiac_sign,
        relationship_type: profile.relationship_type,
        children: profile.children,
        smoking: profile.smoking,
        drinking: profile.drinking,
        exercise: profile.exercise,
        religion: profile.religion,
        gender: profile.gender,
        orientation: profile.orientation,
        show_me: profile.show_me,
        love_languages: profile.love_languages,
        personality_type: profile.personality_type,
        body_type: profile.body_type,
        languages_spoken: profile.languages_spoken,
        dealbreakers: profile.dealbreakers,
        lifestyle: profile.lifestyle,
        preferences: profile.preferences,
        terms_agreement: profile.terms_agreement,
        video_intro_url: profile.video_intro_url,
        ...(profile.instagram_username && { instagram_username: profile.instagram_username }),
        ...(typeof profile.spotify_connected === 'boolean' && { spotify_connected: profile.spotify_connected }),
        ...(profile.spotify_data && { spotify_data: profile.spotify_data }),
        ...(profile.voice_intro_url && { voice_intro_url: profile.voice_intro_url }),
        ...(profile.facebook_id && { facebook_id: profile.facebook_id }),
        ...(typeof profile.social_verified === 'boolean' && { social_verified: profile.social_verified }),
        updated_at: new Date().toISOString(),
      };

      const { data: existingProfileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let profileError;
      
      if (existingProfileData) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id);
        profileError = error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert(profileData);
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
            {profile.job_title && (
              <div className="flex items-center mt-1">
                <Briefcase className="h-4 w-4 mr-1" />
                <span className="text-sm">{profile.job_title}</span>
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
          
          {profile.lifestyle.interests && profile.lifestyle.interests.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.lifestyle.interests.map((interest) => (
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

  const hasRequiredPhoto = photos.some(photo => photo && photo.trim() !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center py-6 sm:py-8">
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {existingProfile ? 'Update Your Profile' : 'Complete Your Profile'}
            </CardTitle>
            <p className="text-pink-100 mt-2 text-sm sm:text-base">Make a great first impression</p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <TabsContent value="basic" className="space-y-6">
                  {/* Modern Photo Upload Section */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-800">Your Photos</Label>
                    <p className="text-sm text-gray-600">Add at least 1 photo, up to 4 photos</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((slotIndex) => (
                        <div key={slotIndex} className="relative aspect-square">
                          {photos[slotIndex] ? (
                            <div className="relative w-full h-full">
                              <img
                                src={photos[slotIndex]}
                                alt={`Profile ${slotIndex + 1}`}
                                className="w-full h-full object-cover rounded-2xl"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(photos[slotIndex], slotIndex)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              {slotIndex === 0 && (
                                <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                                  Main
                                </div>
                              )}
                            </div>
                          ) : (
                            <label className="w-full h-full border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors relative">
                              {uploadingIndex === slotIndex ? (
                                <div className="text-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto mb-2"></div>
                                  <span className="text-xs text-pink-600">Uploading...</span>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <Plus className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-gray-400 mb-2" />
                                  <span className="text-xs text-gray-500 font-medium">
                                    {slotIndex === 0 ? 'Main Photo' : `Photo ${slotIndex + 1}`}
                                  </span>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(e, slotIndex)}
                                className="hidden"
                                disabled={uploadingIndex !== null}
                              />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {!hasRequiredPhoto && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-amber-800 text-sm font-medium">
                          📸 Please upload at least one photo to continue
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile(prev => ({...prev, name: e.target.value}))}
                          className="h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="birthdate" className="text-gray-700 font-medium">Date of Birth</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="birthdate"
                            type="date"
                            value={profile.birthdate}
                            onChange={(e) => {
                              setProfile(prev => ({
                                ...prev, 
                                birthdate: e.target.value,
                                age: calculateAge(e.target.value)
                              }));
                            }}
                            className="pl-10 h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-gray-700 font-medium">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell people about yourself..."
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({...prev, bio: e.target.value}))}
                        rows={4}
                        className="rounded-2xl border-2 border-gray-200 focus:border-pink-400 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-gray-700 font-medium">Location</Label>
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile(prev => ({...prev, location: e.target.value}))}
                          placeholder="City, State"
                          className="h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Gender</Label>
                        <Select value={profile.gender} onValueChange={(value) => setProfile(prev => ({...prev, gender: value}))}>
                          <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="nonbinary">Non-binary</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="lifestyle" className="space-y-6">
                  {/* Work & Education */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Work & Education</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="job_title" className="text-gray-700 font-medium">Job Title</Label>
                        <Input
                          id="job_title"
                          value={profile.job_title}
                          onChange={(e) => setProfile(prev => ({...prev, job_title: e.target.value}))}
                          placeholder="Your profession"
                          className="h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company_name" className="text-gray-700 font-medium">Company</Label>
                        <Input
                          id="company_name"
                          value={profile.company_name}
                          onChange={(e) => setProfile(prev => ({...prev, company_name: e.target.value}))}
                          placeholder="Where you work"
                          className="h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="education" className="text-gray-700 font-medium">Education</Label>
                        <Input
                          id="education"
                          value={profile.education}
                          onChange={(e) => setProfile(prev => ({...prev, education: e.target.value}))}
                          placeholder="School/University"
                          className="h-12 rounded-2xl border-2 border-gray-200 focus:border-pink-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Education Level</Label>
                        <Select value={profile.education_level} onValueChange={(value) => setProfile(prev => ({...prev, education_level: value}))}>
                          <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high_school">High School</SelectItem>
                            <SelectItem value="some_college">Some College</SelectItem>
                            <SelectItem value="bachelor">Bachelor's</SelectItem>
                            <SelectItem value="master">Master's</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Lifestyle Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Lifestyle</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Smoking</Label>
                        <Select value={profile.smoking} onValueChange={(value) => setProfile(prev => ({...prev, smoking: value}))}>
                          <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="sometimes">Sometimes</SelectItem>
                            <SelectItem value="regularly">Regularly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Drinking</Label>
                        <Select value={profile.drinking} onValueChange={(value) => setProfile(prev => ({...prev, drinking: value}))}>
                          <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="socially">Socially</SelectItem>
                            <SelectItem value="regularly">Regularly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Exercise</Label>
                        <Select value={profile.exercise} onValueChange={(value) => setProfile(prev => ({...prev, exercise: value}))}>
                          <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="sometimes">Sometimes</SelectItem>
                            <SelectItem value="often">Often</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Height: {Math.floor(profile.height_cm / 30.48)}'{Math.round(((profile.height_cm / 30.48) % 1) * 12)}" ({profile.height_cm} cm)</Label>
                      <Slider
                        value={[profile.height_cm]}
                        onValueChange={([value]) => setProfile(prev => ({...prev, height_cm: value}))}
                        max={220}
                        min={140}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="space-y-4">
                    <Label className="text-gray-700 font-medium">Interests</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {[
                        'Travel', 'Photography', 'Music', 'Movies', 'Books', 'Fitness', 'Cooking', 'Art',
                        'Dancing', 'Hiking', 'Gaming', 'Sports', 'Fashion', 'Technology', 'Food', 'Wine'
                      ].map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox
                            id={interest}
                            checked={profile.lifestyle.interests?.includes(interest) || false}
                            onCheckedChange={() => {
                              const currentInterests = profile.lifestyle.interests || [];
                              const newInterests = currentInterests.includes(interest)
                                ? currentInterests.filter(i => i !== interest)
                                : [...currentInterests, interest];
                              setProfile(prev => ({
                                ...prev,
                                lifestyle: { ...prev.lifestyle, interests: newInterests }
                              }));
                            }}
                          />
                          <Label htmlFor={interest} className="text-sm">{interest}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-6">
                  <SocialIntegrationPanel currentProfile={profile} />
                </TabsContent>

                {/* Action Buttons */}
                <div className="space-y-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    variant="outline"
                    className="w-full h-12 sm:h-14 border-2 border-pink-200 text-pink-600 hover:bg-pink-50 font-semibold text-base sm:text-lg rounded-2xl"
                    disabled={!hasRequiredPhoto}
                  >
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Preview Profile
                  </Button>

                  <Button
                    type="submit"
                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-base sm:text-lg rounded-2xl shadow-lg"
                    disabled={loading || !hasRequiredPhoto || !profile.name.trim()}
                  >
                    {loading ? 'Saving...' : (existingProfile ? 'Update Profile' : 'Save Profile')}
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
