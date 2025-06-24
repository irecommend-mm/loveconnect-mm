
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, MapPin, User, Mail, Lock, Camera, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SignupData {
  email: string;
  password: string;
  name: string;
  age: string;
  location: string;
  photos: string[];
  latitude?: number;
  longitude?: number;
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
    age: '',
    location: '',
    photos: [],
  });

  const totalSteps = 5;

  const updateData = (field: keyof SignupData, value: any) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateData('latitude', latitude);
          updateData('longitude', longitude);
          
          // Reverse geocoding to get city name
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

  const handleSignup = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: signupData.name,
            age: parseInt(signupData.age),
            location: signupData.location,
            photos: signupData.photos,
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
          title: "Welcome! 🎉",
          description: "Your account has been created successfully.",
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
      case 1: return signupData.email && signupData.password;
      case 2: return signupData.name && signupData.age;
      case 3: return signupData.location;
      case 4: return signupData.photos.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-600">Let's get started with your email</p>
            </div>
            
            <div className="space-y-4">
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
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={(e) => updateData('password', e.target.value)}
                    className="pl-10 h-12"
                    minLength={6}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">About You</h2>
              <p className="text-gray-600">Tell us a bit about yourself</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={signupData.name}
                    onChange={(e) => updateData('name', e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Your age"
                  value={signupData.age}
                  onChange={(e) => updateData('age', e.target.value)}
                  className="h-12"
                  min="18"
                  max="100"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Location</h2>
              <p className="text-gray-600">Help us find people near you</p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={handleLocationAccess}
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600"
                variant="default"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Use My Current Location
              </Button>
              
              <div className="relative">
                <Label htmlFor="location">Or enter manually</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="City, State"
                  value={signupData.location}
                  onChange={(e) => updateData('location', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Photos</h2>
              <p className="text-gray-600">Upload at least one photo to continue</p>
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
                    ×
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
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Set! 🎉</h2>
              <p className="text-gray-600">Ready to start your journey?</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p><strong>Email:</strong> {signupData.email}</p>
              <p><strong>Name:</strong> {signupData.name}, {signupData.age}</p>
              <p><strong>Location:</strong> {signupData.location}</p>
              <p><strong>Photos:</strong> {signupData.photos.length} uploaded</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
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
                disabled={loading}
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
