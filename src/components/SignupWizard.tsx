
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Upload, MapPin, User, Mail, Lock, Camera, ArrowLeft, ArrowRight, X, Heart, Calendar, Briefcase, GraduationCap, Users, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SignupData {
  // Step 1: Basic Info
  email: string;
  password: string;
  name: string;
  birthdate: string;
  gender: string;
  orientation: string[];
  location: string;
  latitude?: number;
  longitude?: number;
  
  // Step 2: Visual Identity
  photos: string[];
  video_intro_url?: string;
  
  // Step 3: Work & Education
  job_title: string;
  company_name: string;
  education: string;
  education_level: string;
  
  // Step 4: Lifestyle & Traits
  zodiac_sign: string;
  smoking: string;
  drinking: string;
  exercise: string;
  religion: string;
  languages_spoken: string[];
  personality_type: string;
  body_type: string;
  height_cm: number;
  
  // Step 5: Love & Relationship
  relationship_type: string;
  love_languages: string[];
  dealbreakers: string[];
  show_me: string[];
  interests: string[];
  preferences: {
    age_range: [number, number];
    max_distance: number;
  };
  
  // Step 6: Consent
  terms_agreement: boolean;
}

interface SignupWizardProps {
  onComplete: () => void;
}

const SignupWizard = ({ onComplete }: SignupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [signupData, setSignupData] = useState<SignupData>({
    email: '',
    password: '',
    name: '',
    birthdate: '',
    gender: '',
    orientation: [],
    location: '',
    photos: [],
    job_title: '',
    company_name: '',
    education: '',
    education_level: '',
    zodiac_sign: '',
    smoking: '',
    drinking: '',
    exercise: '',
    religion: '',
    languages_spoken: [],
    personality_type: '',
    body_type: '',
    height_cm: 170,
    relationship_type: '',
    love_languages: [],
    dealbreakers: [],
    show_me: [],
    interests: [],
    preferences: {
      age_range: [18, 50],
      max_distance: 50
    },
    terms_agreement: false
  });

  const totalSteps = 6;

  const updateData = (field: keyof SignupData, value: any) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleLocationAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateData('latitude', latitude);
          updateData('longitude', longitude);
          
          fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`)
            .then(response => response.json())
            .then(data => {
              if (data.results && data.results[0]) {
                const city = data.results[0].components.city || data.results[0].components.town || 'Unknown';
                updateData('location', city);
              }
            })
            .catch(() => {
              updateData('location', 'Location detected');
            });
          
          toast({
            title: "Location accessed",
            description: "Your location has been detected successfully.",
          });
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Please enter your location manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setLoading(true);
    const uploadedUrls: string[] = [];

    for (const file of files.slice(0, 6 - signupData.photos.length)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `temp/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }
    }

    updateData('photos', [...signupData.photos, ...uploadedUrls]);
    setLoading(false);
  };

  const removePhoto = (index: number) => {
    const newPhotos = signupData.photos.filter((_, i) => i !== index);
    updateData('photos', newPhotos);
  };

  const toggleArrayValue = (array: string[], value: string, field: keyof SignupData) => {
    const newArray = array.includes(value) 
      ? array.filter(item => item !== value)
      : [...array, value];
    updateData(field, newArray);
  };

  const handleSignup = async () => {
    setLoading(true);
    
    try {
      const age = calculateAge(signupData.birthdate);
      
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: signupData.name,
            age,
            birthdate: signupData.birthdate,
            gender: signupData.gender,
            orientation: signupData.orientation,
            location: signupData.location,
            photos: signupData.photos,
            job_title: signupData.job_title,
            company_name: signupData.company_name,
            education: signupData.education,
            education_level: signupData.education_level,
            zodiac_sign: signupData.zodiac_sign,
            lifestyle: {
              smoking: signupData.smoking,
              drinking: signupData.drinking,
              exercise: signupData.exercise,
              religion: signupData.religion,
              interests: signupData.interests
            },
            preferences: signupData.preferences,
            show_me: signupData.show_me,
            love_languages: signupData.love_languages,
            personality_type: signupData.personality_type,
            body_type: signupData.body_type,
            height_cm: signupData.height_cm,
            height_feet: signupData.height_cm * 0.0328084,
            relationship_type: signupData.relationship_type,
            dealbreakers: signupData.dealbreakers,
            languages_spoken: signupData.languages_spoken,
            terms_agreement: signupData.terms_agreement,
            video_intro_url: signupData.video_intro_url,
            latitude: signupData.latitude,
            longitude: signupData.longitude,
          }
        }
      });

      if (error) {
        toast({
          title: "Signup Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome to VibeConnect! 🎉",
          description: "Your account has been created successfully. Please check your email to confirm.",
        });
        onComplete();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return signupData.email && signupData.password && signupData.name && signupData.birthdate && signupData.gender && signupData.orientation.length > 0 && signupData.location;
      case 2: return signupData.photos.length > 0;
      case 3: return signupData.job_title && signupData.education && signupData.education_level;
      case 4: return signupData.personality_type && signupData.body_type;
      case 5: return signupData.relationship_type && signupData.show_me.length > 0 && signupData.interests.length >= 3;
      case 6: return signupData.terms_agreement;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Let's start with the basics</h2>
              <p className="text-gray-600">Tell us about yourself</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => updateData('email', e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create password"
                      value={signupData.password}
                      onChange={(e) => updateData('password', e.target.value)}
                      className="pl-10 h-12"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={signupData.name}
                    onChange={(e) => updateData('name', e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="birthdate">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="birthdate"
                    type="date"
                    value={signupData.birthdate}
                    onChange={(e) => updateData('birthdate', e.target.value)}
                    className="pl-10 h-12"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Gender</Label>
                  <Select value={signupData.gender} onValueChange={(value) => updateData('gender', value)}>
                    <SelectTrigger className="h-12">
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

                <div>
                  <Label>Orientation</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {['Straight', 'Gay', 'Bisexual', 'Pansexual', 'Asexual', 'Other'].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={signupData.orientation.includes(option)}
                          onCheckedChange={() => toggleArrayValue(signupData.orientation, option, 'orientation')}
                        />
                        <Label htmlFor={option} className="text-sm">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label>Location</Label>
                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={handleLocationAccess}
                    className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600"
                    variant="default"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Use My Current Location
                  </Button>
                  
                  <Input
                    placeholder="Or enter city manually"
                    value={signupData.location}
                    onChange={(e) => updateData('location', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Show your best self</h2>
              <p className="text-gray-600">Add photos to make a great first impression</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {signupData.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {signupData.photos.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-400 bg-gray-50">
                  <Camera className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <Label htmlFor="video">Video Intro (Optional)</Label>
              <Input
                id="video"
                type="url"
                placeholder="Video URL (30 seconds max)"
                value={signupData.video_intro_url || ''}
                onChange={(e) => updateData('video_intro_url', e.target.value)}
                className="h-12"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Work & Education</h2>
              <p className="text-gray-600">Tell us about your career and studies</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="job_title">Job Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="job_title"
                    placeholder="e.g., Software Engineer"
                    value={signupData.job_title}
                    onChange={(e) => updateData('job_title', e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company_name">Company (Optional)</Label>
                <Input
                  id="company_name"
                  placeholder="Where do you work?"
                  value={signupData.company_name}
                  onChange={(e) => updateData('company_name', e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="education">Education</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="education"
                    placeholder="School/University name"
                    value={signupData.education}
                    onChange={(e) => updateData('education', e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div>
                <Label>Education Level</Label>
                <Select value={signupData.education_level} onValueChange={(value) => updateData('education_level', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="some_college">Some College</SelectItem>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Lifestyle & Traits</h2>
              <p className="text-gray-600">Help others get to know you better</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Smoking</Label>
                  <Select value={signupData.smoking} onValueChange={(value) => updateData('smoking', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="sometimes">Sometimes</SelectItem>
                      <SelectItem value="regularly">Regularly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Drinking</Label>
                  <Select value={signupData.drinking} onValueChange={(value) => updateData('drinking', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="socially">Socially</SelectItem>
                      <SelectItem value="regularly">Regularly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Exercise</Label>
                  <Select value={signupData.exercise} onValueChange={(value) => updateData('exercise', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="sometimes">Sometimes</SelectItem>
                      <SelectItem value="regularly">Regularly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Religion</Label>
                  <Select value={signupData.religion} onValueChange={(value) => updateData('religion', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="christian">Christian</SelectItem>
                      <SelectItem value="muslim">Muslim</SelectItem>
                      <SelectItem value="jewish">Jewish</SelectItem>
                      <SelectItem value="hindu">Hindu</SelectItem>
                      <SelectItem value="buddhist">Buddhist</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Personality Type</Label>
                <Select value={signupData.personality_type} onValueChange={(value) => updateData('personality_type', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select personality type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="introvert">Introvert</SelectItem>
                    <SelectItem value="extrovert">Extrovert</SelectItem>
                    <SelectItem value="ambivert">Ambivert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Body Type</Label>
                <Select value={signupData.body_type} onValueChange={(value) => updateData('body_type', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slim">Slim</SelectItem>
                    <SelectItem value="athletic">Athletic</SelectItem>
                    <SelectItem value="fit">Fit</SelectItem>
                    <SelectItem value="curvy">Curvy</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="full">Full figured</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Height: {Math.floor(signupData.height_cm / 30.48)}'{Math.round(((signupData.height_cm / 30.48) % 1) * 12)}" ({signupData.height_cm} cm)</Label>
                <Slider
                  value={[signupData.height_cm]}
                  onValueChange={([value]) => updateData('height_cm', value)}
                  max={220}
                  min={140}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Languages Spoken</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic'].map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={lang}
                        checked={signupData.languages_spoken.includes(lang)}
                        onCheckedChange={() => toggleArrayValue(signupData.languages_spoken, lang, 'languages_spoken')}
                      />
                      <Label htmlFor={lang} className="text-sm">{lang}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Love & Relationships</h2>
              <p className="text-gray-600">What are you looking for?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Looking for</Label>
                <Select value={signupData.relationship_type} onValueChange={(value) => updateData('relationship_type', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="What are you looking for?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serious">Long-term relationship</SelectItem>
                    <SelectItem value="casual">Something casual</SelectItem>
                    <SelectItem value="friendship">New friends</SelectItem>
                    <SelectItem value="unsure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Show Me</Label>
                <div className="space-y-2">
                  {['Men', 'Women', 'Non-binary people'].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={signupData.show_me.includes(option)}
                        onCheckedChange={() => toggleArrayValue(signupData.show_me, option, 'show_me')}
                      />
                      <Label htmlFor={option} className="text-sm">{option}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Love Languages</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['Words of Affirmation', 'Quality Time', 'Physical Touch', 'Acts of Service', 'Receiving Gifts'].map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={lang}
                        checked={signupData.love_languages.includes(lang)}
                        onCheckedChange={() => toggleArrayValue(signupData.love_languages, lang, 'love_languages')}
                      />
                      <Label htmlFor={lang} className="text-sm">{lang}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Interests (Choose at least 3)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {[
                    'Travel', 'Photography', 'Music', 'Movies', 'Books', 'Fitness', 'Cooking', 'Art',
                    'Dancing', 'Hiking', 'Gaming', 'Sports', 'Fashion', 'Technology', 'Food', 'Wine',
                    'Coffee', 'Yoga', 'Meditation', 'Volunteering'
                  ].map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={signupData.interests.includes(interest)}
                        onCheckedChange={() => toggleArrayValue(signupData.interests, interest, 'interests')}
                      />
                      <Label htmlFor={interest} className="text-sm">{interest}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Age Range: {signupData.preferences.age_range[0]} - {signupData.preferences.age_range[1]}</Label>
                <Slider
                  value={signupData.preferences.age_range}
                  onValueChange={(value) => updateData('preferences', {...signupData.preferences, age_range: value as [number, number]})}
                  max={80}
                  min={18}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Max Distance: {signupData.preferences.max_distance} km</Label>
                <Slider
                  value={[signupData.preferences.max_distance]}
                  onValueChange={([value]) => updateData('preferences', {...signupData.preferences, max_distance: value})}
                  max={200}
                  min={5}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Almost there! 🎉</h2>
              <p className="text-gray-600">Review and agree to our terms</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-800">Profile Summary</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {signupData.name}, {calculateAge(signupData.birthdate)}</p>
                <p><strong>Location:</strong> {signupData.location}</p>
                <p><strong>Job:</strong> {signupData.job_title}</p>
                <p><strong>Education:</strong> {signupData.education_level}</p>
                <p><strong>Looking for:</strong> {signupData.relationship_type}</p>
                <p><strong>Photos:</strong> {signupData.photos.length} uploaded</p>
                <p><strong>Interests:</strong> {signupData.interests.join(', ')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={signupData.terms_agreement}
                  onCheckedChange={(checked) => updateData('terms_agreement', checked)}
                />
                <Label htmlFor="terms" className="text-sm leading-5">
                  I agree to the Terms of Service and Privacy Policy. I'm at least 18 years old and understand that VibeConnect uses my data to provide better matches.
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i + 1 <= currentStep ? 'bg-pink-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-lg">Step {currentStep} of {totalSteps}</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between mt-8 space-x-4">
            {currentStep > 1 && (
              <Button
                onClick={() => setCurrentStep(currentStep - 1)}
                variant="outline"
                className="flex-1 h-12"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-purple-600"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSignup}
                disabled={!canProceed() || loading}
                className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-purple-600"
              >
                {loading ? 'Creating Account...' : 'Complete Signup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupWizard;
