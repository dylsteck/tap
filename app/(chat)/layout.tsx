import { cookies } from 'next/headers';

import Providers from '@/components/custom/providers';

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    // <SidebarInset>
      <Providers>
        {children}
      </Providers>
    // </SidebarInset>
  );
}
