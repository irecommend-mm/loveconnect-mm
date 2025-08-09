
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface FiltersModalProps {
  open: boolean;
  onClose: () => void;
}

const FiltersModal = ({ open, onClose }: FiltersModalProps) => {
  const [ageRange, setAgeRange] = useState([18, 35]);
  const [maxDistance, setMaxDistance] = useState([50]);
  const [relationshipGoal, setRelationshipGoal] = useState('');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Discovery Filters
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">
              Age Range: {ageRange[0]} - {ageRange[1]}
            </label>
            <Slider
              value={ageRange}
              onValueChange={setAgeRange}
              min={18}
              max={60}
              step={1}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-3 block">
              Maximum Distance: {maxDistance[0]} km
            </label>
            <Slider
              value={maxDistance}
              onValueChange={setMaxDistance}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-3 block">
              Looking For
            </label>
            <Select value={relationshipGoal} onValueChange={setRelationshipGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serious">Long-term relationship</SelectItem>
                <SelectItem value="casual">Casual dating</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="unsure">Not sure yet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onClose} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FiltersModal;
