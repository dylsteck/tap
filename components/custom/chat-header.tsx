import { User } from 'next-auth';

import { SidebarToggle } from '@/components/custom/sidebar-toggle';
import { Button } from '@/components/ui/button';

import { NewChatToggle } from './new-chat-toggle';

export function ChatHeader({ user }: { user: User | undefined }){
  return (
    <header className="flex h-16 sticky top-0 bg-background md:h-12 items-center px-2 md:px-2 z-10">
      <SidebarToggle user={user} />
      <NewChatToggle />
    </header>
  );
}
