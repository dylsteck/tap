import Image from 'next/image';

import { auth } from '@/app/(auth)/auth';
import { ChatHeader } from '@/components/custom/chat-header';

export default async function Page() {
  const session = await auth();
  
  return(
    <div>
      <ChatHeader user={session?.user} />
      {session && session.user ? 
      <div>
        <div className="p-3 pl-5 flex flex-row gap-2 items-center">
          <Image className="size-15 rounded-full" src={(session.user as any).pfp_url} width={50} height={50} alt={`${(session.user as any).username ?? 'User'} PFP`} />
          <p className="text-xl font-medium">{(session.user as any).username}</p>
        </div>
        <hr/>
      </div>
      : null
      }
    </div>
  );
}