'use client';

import { useState, useEffect } from 'react';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { grantFreeCredits } from '@/actions/billing/grant-free-credits';

export function FreeCreditsButton() {
  const [isPending, startTransition] = useTransition();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures this only renders on client
  }, []);

  if (!isClient) {
    return null;
  }

  // ✅ You must RETURN this JSX
  return (
    <Button
      size="lg"
      className="text-xs text-black gap-2 px-4 py-2"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await grantFreeCredits();
          res.success ? toast.success(res.message) : toast.error(res.message);
        });
      }}
    >
      {isPending ? 'Processing...' : 'Get Free Credits'}
    </Button>
  );
}
