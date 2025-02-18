import { SidebarToggle } from '@/components/custom/sidebar-toggle';
import { Button } from '@/components/ui/button';

export function VideoHeader(){
  return (
    <header className="flex h-16 sticky top-0 bg-background md:h-12 items-center px-2 md:px-2 z-10">
      <SidebarToggle />
    </header>
  );
}