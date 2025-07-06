
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Loader2 } from 'lucide-react';
import { populateMockData } from '@/utils/mockDataGenerator';
import { toast } from '@/hooks/use-toast';

const MockDataButton = () => {
  const [loading, setLoading] = useState(false);

  const handlePopulateData = async () => {
    setLoading(true);
    try {
      const success = await populateMockData();
      if (success) {
        toast({
          title: "Mock data populated! 🎉",
          description: "Sample profiles, events, and matches have been added to the database.",
        });
        // Refresh the page to show new data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: "Failed to populate mock data. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePopulateData}
      disabled={loading}
      className="fixed bottom-4 left-4 bg-green-500 hover:bg-green-600 text-white shadow-lg z-40"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Database className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Adding Data...' : 'Add Mock Data'}
    </Button>
  );
};

export default MockDataButton;
