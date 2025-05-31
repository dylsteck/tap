import { MODEL_NAME } from '@tap/common';
import { SidebarInset, SidebarProvider } from '@tap/ui/components/sidebar';
import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import Providers from '@/components/providers';

import { auth } from '../(auth)/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  return(
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar user={session?.user} selectedModelName={MODEL_NAME} />
      <SidebarInset>
        <Providers session={session}>
          {children}
        </Providers>
      </SidebarInset>
    </SidebarProvider>
  )
}
