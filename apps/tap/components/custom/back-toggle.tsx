'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ComponentProps } from 'react';

import { BetterTooltip } from '@workspace/ui/components/tooltip';
import { cn } from "@workspace/ui/lib/utils"

export function BackToggle({
  className,
}: ComponentProps<'button'>) {
  const router = useRouter();

  return (
    <BetterTooltip content="Back" align="start">
      <button
        onClick={() => router.back()}
        className={cn(
          'inline-flex items-center justify-center rounded-md hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 size-10 md:size-8 [&>svg]:!size-5 md:[&>svg]:!size-4',
          className
        )}
      >
        <ArrowLeft className="size-5" />
      </button>
    </BetterTooltip>
  );
}