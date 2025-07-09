
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Stories = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCreateStory = () => {
    toast({
      title: "Coming Soon! 📸",
      description: "Stories feature will be available soon.",
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Stories</h2>
      
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {/* Add Story Button */}
        <button
          onClick={handleCreateStory}
          className="flex-shrink-0 flex flex-col items-center space-y-2"
        >
          <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
          <span className="text-xs text-gray-600">Your Story</span>
        </button>

        <div className="flex-1 flex items-center justify-center py-8">
          <div className="text-center">
            <Camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Stories coming soon!</p>
            <p className="text-sm text-gray-400 mt-1">Share moments that disappear after 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stories;
