'use client';

import { Button } from '@workspace/ui/components/button';
import { BetterTooltip } from '@workspace/ui/components/tooltip';
import { cn } from "@workspace/ui/lib/utils"
import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';


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
