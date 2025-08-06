
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSafetyFeatures } from '@/hooks/useSafetyFeatures';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export const ReportModal = ({ open, onClose, userId, userName }: ReportModalProps) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const { reportUser, loading } = useSafetyFeatures();

  const reasons = [
    'Inappropriate photos',
    'Harassment or bullying',
    'Fake profile',
    'Spam or scam',
    'Inappropriate messages',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!reason) return;
    
    await reportUser(userId, reason, description);
    onClose();
    setReason('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report {userName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Why are you reporting this user?</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="mt-2">
              {reasons.map((reasonOption) => (
                <div key={reasonOption} className="flex items-center space-x-2">
                  <RadioGroupItem value={reasonOption} id={reasonOption} />
                  <Label htmlFor={reasonOption} className="text-sm">{reasonOption}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context..."
              className="mt-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!reason || loading}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
