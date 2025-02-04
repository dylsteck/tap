"use client"

import { History, Settings, Smile, Trash } from "lucide-react"
import { usePathname, useRouter } from "next/navigation";
import { User } from 'next-auth';
import * as React from "react"
import { toast } from 'sonner';
import useSWR from 'swr'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Chat } from "@/db/schema"
import { fetcher, getTitleFromChat } from "@/lib/utils";

import { Button } from "../ui/button"
import { BetterTooltip } from "../ui/tooltip"

export function SidebarToggle({ user }: { user: User | undefined }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const { data: history = [], mutate, isLoading } = useSWR<Array<Chat>>(user ? '/api/history' : null, fetcher, {
    fallbackData: [],
  })

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "h" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const handleDelete = async (deleteId: string) => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: 'DELETE',
    });
    toast.promise(deletePromise, {
      loading: 'Deleting chat...',
      success: () => {
        mutate((currentHistory = []) => currentHistory.filter((h) => h.id !== deleteId));
        if (pathname.includes(deleteId)) {
          router.push('/');
        }
        return 'Chat deleted successfully';
      },
      error: 'Failed to delete chat',
    });
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex h-screen items-center justify-center">
        <BetterTooltip content="History ⌘+H" align="start">
          <Button
            data-sidebar="trigger"
            variant="ghost"
            size="icon"
            className="size-10 md:size-8 [&>svg]:!size-5 md:[&>svg]:!size-4"
            onClick={() => setOpen(true)}
          >
            <History className="size-5" />
          </Button>
        </BetterTooltip>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search chats..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Chats">
            {isLoading ? (
              <CommandItem>
                <span>Loading...</span>
              </CommandItem>
            ) : history.length === 0 ? (
              <CommandItem>
                <span>No chats found</span>
              </CommandItem>
            ) : (
              history.map((chat) => (
                <CommandItem className="cursor-pointer w-full" key={chat.id}>
                  <div className="w-full max-h-[15px] flex flex-row justify-between items-center">
                    <span onClick={() => router.push(`/chat/${chat.id}`)}>
                      {getTitleFromChat(chat)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(chat.id);
                      }}
                      aria-label="Delete chat"
                    >
                      <Trash className="size-3" />
                    </Button>
                  </div>
                </CommandItem>
              ))
            )}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </CommandDialog>
    </>
  )
}