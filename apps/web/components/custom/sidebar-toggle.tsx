import { SidebarTrigger } from '@workspace/ui/components/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';
import { ComponentProps } from 'react';

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger
          className={cn(
            'size-10 md:size-8 [&>svg]:!size-5 md:[&>svg]:!size-4',
            className
          )}
        />
      </TooltipTrigger>
      <TooltipContent side="right" align="start">
        Toggle Sidebar
      </TooltipContent>
    </Tooltip>
  );
}
