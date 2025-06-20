
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus } from 'lucide-react';
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
  
  const [profile, setProfile] = useState<ProfileData>({
    name: existingProfile?.name || '',
    age: existingProfile?.age || 18,
    bio: existingProfile?.bio || '',
    location: existingProfile?.location || '',
    job: existingProfile?.job || '',
    education: existingProfile?.education || '',
    height: existingProfile?.height || '',
    zodiac_sign: existingProfile?.zodiac_sign || '',
    relationship_type: existingProfile?.relationship_type || '',
    children: existingProfile?.children || '',
    smoking: existingProfile?.smoking || '',
    drinking: existingProfile?.drinking || '',
    exercise: existingProfile?.exercise || '',
  });

  useEffect(() => {
    if (user) {
      loadUserPhotos();
      loadUserInterests();
    }
  }, [user]);

  const loadUserPhotos = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('photos')
      .select('url')
      .eq('user_id', user.id)
      .order('position');

    if (!error && data) {
      setPhotos(data.map(photo => photo.url));
    }
  };

  const loadUserInterests = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('interests')
      .select('interest')
      .eq('user_id', user.id);

    if (!error && data) {
      setInterests(data.map(item => item.interest));
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

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      toast({
        title: "Profile Error",
        description: profileError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Update interests
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
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photos Section */}
            <div className="space-y-4">
              <Label>Photos (Add at least one photo)</Label>
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={photo}
                      alt={`Profile ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo, index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-400">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <span className="text-sm text-gray-500">Add Photo</span>
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

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell people about yourself..."
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  placeholder="City, State"
                />
              </div>
              <div>
                <Label htmlFor="job">Job</Label>
                <Input
                  id="job"
                  value={profile.job}
                  onChange={(e) => setProfile({...profile, job: e.target.value})}
                  placeholder="Your profession"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={profile.education}
                  onChange={(e) => setProfile({...profile, education: e.target.value})}
                  placeholder="School/University"
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={profile.height}
                  onChange={(e) => setProfile({...profile, height: e.target.value})}
                  placeholder="e.g., 5'8\""
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Looking for</Label>
                <Select value={profile.relationship_type} onValueChange={(value) => setProfile({...profile, relationship_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serious">Serious relationship</SelectItem>
                    <SelectItem value="casual">Casual dating</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="unsure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Children</Label>
                <Select value={profile.children} onValueChange={(value) => setProfile({...profile, children: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="have">Have kids</SelectItem>
                    <SelectItem value="want">Want kids</SelectItem>
                    <SelectItem value="dont_want">Don't want kids</SelectItem>
                    <SelectItem value="unsure">Not sure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Smoking</Label>
                <Select value={profile.smoking} onValueChange={(value) => setProfile({...profile, smoking: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="sometimes">Sometimes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Drinking</Label>
                <Select value={profile.drinking} onValueChange={(value) => setProfile({...profile, drinking: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="sometimes">Sometimes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Exercise</Label>
                <Select value={profile.exercise} onValueChange={(value) => setProfile({...profile, exercise: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
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
              <Label>Interests</Label>
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                />
                <Button type="button" onClick={addInterest} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="cursor-pointer" onClick={() => removeInterest(interest)}>
                    {interest} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              disabled={loading || photos.length === 0}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
