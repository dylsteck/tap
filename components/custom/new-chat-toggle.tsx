'use client';

import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BetterTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

export function NewChatToggle() {
  const router = useRouter();
  return (
    <BetterTooltip content="New Chat" align="start">
      <Button
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className="size-10 md:size-8 [&>svg]:!size-5 md:[&>svg]:!size-4"
      onClick={(event) => {
        event.preventDefault();
        router.push('/');
      }}
    >
      <PlusIcon className="size-3" />
    </Button>
    </BetterTooltip>
  );
}
