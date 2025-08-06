
import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Flag, Shield } from 'lucide-react';
import { ReportModal } from './ReportModal';
import { useSafetyFeatures } from '@/hooks/useSafetyFeatures';

interface SafetyMenuProps {
  userId: string;
  userName: string;
}

export const SafetyMenu = ({ userId, userName }: SafetyMenuProps) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const { blockUser, loading } = useSafetyFeatures();

  const handleBlock = async () => {
    await blockUser(userId);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShowReportModal(true)}>
            <Flag className="h-4 w-4 mr-2" />
            Report User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBlock} disabled={loading}>
            <Shield className="h-4 w-4 mr-2" />
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        userId={userId}
        userName={userName}
      />
    </>
  );
};
