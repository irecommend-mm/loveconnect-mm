
import React, { useState } from 'react';
import { Camera, Check, X, Shield, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ProfileVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const ProfileVerification = ({ isOpen, onClose, onComplete }: ProfileVerificationProps) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationPhoto, setVerificationPhoto] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setVerificationPhoto(e.target?.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVerification = () => {
    setIsProcessing(true);
    
    // Simulate verification process
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      toast({
        title: "Verification submitted! ✅",
        description: "Your profile will be verified within 24 hours.",
      });
    }, 2000);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
    toast({
      title: "Verification complete!",
      description: "Your profile is now verified and will be shown as trusted.",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Profile Verification
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === 1 && (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold mb-4">Get Verified</h3>
            <p className="text-gray-600 mb-6">
              Help others know you're real by taking a quick selfie that matches your profile photos.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Increase your matches by up to 3x</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Show others you're trustworthy</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Get priority in discovery</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-full cursor-pointer">
                  <Camera className="h-5 w-5 mr-2" />
                  Take Verification Photo
                </Button>
              </label>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full py-3 rounded-full"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        )}

        {step === 2 && verificationPhoto && (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Review Your Photo</h3>
            <p className="text-gray-600 mb-6">
              Make sure your face is clearly visible and matches your profile photos.
            </p>

            <div className="mb-6">
              <img
                src={verificationPhoto}
                alt="Verification"
                className="w-48 h-48 object-cover rounded-2xl mx-auto"
              />
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleSubmitVerification}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-full"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Submit for Verification
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="w-full py-3 rounded-full"
              >
                Retake Photo
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Check className="h-10 w-10 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold mb-4">Verification Submitted!</h3>
            <p className="text-gray-600 mb-6">
              We'll review your photo and verify your profile within 24 hours. You'll get a notification once it's complete.
            </p>

            <Button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3 rounded-full"
            >
              Great, Thanks!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileVerification;
