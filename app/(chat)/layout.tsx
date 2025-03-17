import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/custom/app-sidebar';
import MobileNav from '@/components/custom/mobile-nav';
import Providers from '@/components/custom/providers';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { MODEL_NAME } from '@/lib/model';

import { auth } from '../(auth)/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  return(
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar user={session?.user} selectedModelName={MODEL_NAME} />
      <SidebarInset>
        <Providers>
          {children}
        </Providers>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
