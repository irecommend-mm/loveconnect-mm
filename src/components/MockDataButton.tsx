
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

const MockDataButton = () => {
  const handleAddMockData = () => {
    console.log('Mock data button clicked - use SQL queries provided earlier');
    alert('Please use the SQL queries provided in the chat to add mock data via Supabase SQL Editor');
  };

  return (
    <Button
      onClick={handleAddMockData}
      className="fixed bottom-16 left-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg transition-colors z-40"
      size="sm"
    >
      <Database className="h-4 w-4 mr-2" />
      Add Mock Data
    </Button>
  );
};

export default MockDataButton;
