import { SidebarToggle } from '@/components/custom/sidebar-toggle';

export function VideoHeader(){
  return (
    <header className="absolute top-0 left-0 z-50 p-4">
      <SidebarToggle />
    </header>
  );
}