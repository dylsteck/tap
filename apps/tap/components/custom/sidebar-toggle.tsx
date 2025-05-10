import { ComponentProps } from 'react';

import { SidebarTrigger } from '@workspace/ui/components/sidebar';
import { BetterTooltip } from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  return (
    <BetterTooltip content="Toggle Sidebar" align="start">
      <SidebarTrigger
        className={cn(
          'size-10 md:size-8 [&>svg]:!size-5 md:[&>svg]:!size-4',
          className
        )}
      />
    </BetterTooltip>
  );
}
