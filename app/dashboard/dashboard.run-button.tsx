'use client';

import { useState } from 'react';

import { PlayIcon, Loader2Icon } from 'lucide-react';

import { runDiscoveryAction } from './dashboard.actions';
import { Button } from '@/components/ui/button';

export function RunDiscoveryButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async () => {
    setIsLoading(true);
    try {
      await runDiscoveryAction();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className='bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95'
      disabled={isLoading}
      onClick={handleRun}
    >
      {isLoading ? (
        <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
      ) : (
        <PlayIcon className='mr-2 h-4 w-4 fill-current' />
      )}
      {isLoading ? 'Executing Discovery...' : 'Run New Discovery'}
    </Button>
  );
}
