'use client';
import { ChevronUp, Moon, Sun, LogOut, Settings } from 'lucide-react';
import Image from 'next/image';
import { type User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar';

import { SidebarSettingsDialog } from './sidebar-settings-dialog';

export function SidebarUserNav({ user, selectedModelName }: { user: User, selectedModelName: string }) {
  const { setTheme, theme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <Image
                src={(user as any).pfp_url}
                alt={(user as any).username ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span>{(user as any).username}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'light' ? (
                <Moon className="mr-2 size-4" />
              ) : (
                <Sun className="mr-2 size-4" />
              )}
              {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <button
                className="w-full flex items-center"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="mr-2 size-4" />
                Settings
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <button
                className="w-full flex items-center"
                onClick={() => {
                  signOut({
                    redirectTo: '/',
                  });
                }}
              >
                <LogOut className="mr-2 size-4" />
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <SidebarSettingsDialog username={(user as any).username} isOpen={isSettingsOpen} selectedModelName={selectedModelName} onClose={() => setIsSettingsOpen(false)} />
    </SidebarMenu>
  );
}