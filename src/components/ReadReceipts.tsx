
import React from 'react';
import { Check, CheckCheck, Eye } from 'lucide-react';

interface ReadReceiptsProps {
  messageStatus: 'sent' | 'delivered' | 'read';
  timestamp?: string;
  showTime?: boolean;
}

const ReadReceipts = ({ messageStatus, timestamp, showTime = false }: ReadReceiptsProps) => {
  const getStatusIcon = () => {
    switch (messageStatus) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (messageStatus) {
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center space-x-1 text-xs text-gray-500">
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {showTime && timestamp && (
        <>
          <span>•</span>
          <span>{timestamp}</span>
        </>
      )}
    </div>
  );
};

export default ReadReceipts;
