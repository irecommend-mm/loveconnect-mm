import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, RefreshCw, Settings } from 'lucide-react';
import { getCurrentEnvironment, switchEnvironment } from '@/integrations/supabase/client';

const EnvironmentSwitcher = () => {
  const [currentEnv, setCurrentEnv] = useState(getCurrentEnvironment());
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (env: 'main' | 'bolt-version') => {
    if (env === currentEnv) return;
    
    setSwitching(true);
    try {
      switchEnvironment(env);
    } catch (error) {
      console.error('Error switching environment:', error);
      setSwitching(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg border p-3 z-50">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Database:</span>
        </div>
        
        <Badge 
          variant={currentEnv === 'bolt-version' ? 'default' : 'secondary'}
          className={currentEnv === 'bolt-version' ? 'bg-purple-500' : 'bg-blue-500'}
        >
          {currentEnv === 'bolt-version' ? 'Bolt Version' : 'Main'}
        </Badge>
        
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant={currentEnv === 'main' ? 'default' : 'outline'}
            onClick={() => handleSwitch('main')}
            disabled={switching}
            className="h-7 px-2 text-xs"
          >
            Main
          </Button>
          <Button
            size="sm"
            variant={currentEnv === 'bolt-version' ? 'default' : 'outline'}
            onClick={() => handleSwitch('bolt-version')}
            disabled={switching}
            className="h-7 px-2 text-xs bg-purple-500 hover:bg-purple-600"
          >
            Bolt
          </Button>
        </div>
        
        {switching && (
          <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Switch between database environments
      </div>
    </div>
  );
};

export default EnvironmentSwitcher;