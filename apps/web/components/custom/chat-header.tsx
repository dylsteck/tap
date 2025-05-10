import { Button } from '@tap/ui/components/button';

import { SidebarToggle } from '@/components/custom/sidebar-toggle';

export function ChatHeader(){
  return (
    <header className="flex h-16 sticky top-0 bg-background md:h-12 items-center px-2 md:px-2 z-10">
      <SidebarToggle />
    </header>
  );
}
