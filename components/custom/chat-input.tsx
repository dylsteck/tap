"use client";

import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { toast } from 'sonner';

import { profiles } from '@/lib/tools';
import { ChatProfileId } from '@/lib/types';

import { ArrowUpIcon, StopIcon } from './icons';
import useWindowSize from '../../hooks/use-window-size';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Textarea } from '../ui/textarea';

export function ChatInput({
  input,
  setInput,
  isLoading,
  stop,
  messages,
  profile,
  setProfile,
  append,
  handleSubmit,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  messages: Array<Message>;
  profile: ChatProfileId;
  setProfile: (value: ChatProfileId) => void;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  const selectedProfile = profiles.find((item) => item.id === profile) || profiles[0];

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submitForm = useCallback(() => {
    handleSubmit(undefined, {});
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [handleSubmit, setInput]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (isLoading) {
        toast.error('Please wait for the model to finish its response!');
      } else {
        submitForm();
      }
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-4">
      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className="min-h-[48px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted"
        rows={2}
        onKeyDown={handleKeyDown}
      />

      <div className="absolute bottom-0 right-9 p-2 pb-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full h-8 px-2 flex items-center gap-2 border dark:border-zinc-600">
              {selectedProfile.icon && <selectedProfile.icon />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px] p-1 rounded-md bg-white dark:bg-neutral-800">
            {profiles.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onSelect={() => setProfile(item.id as any)}
                className="flex items-start gap-2 px-2 py-1.5 rounded-md text-xs mb-1 last:mb-0 cursor-pointer"
              >
                 {item.icon && <item.icon />}
                <div>
                  <div className="font-bold">{item.name}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="absolute bottom-0 right-0 p-2">
        {isLoading ? (
          <Button onClick={stop} className="rounded-full p-1.5 h-fit border dark:border-zinc-600">
            <StopIcon size={14} />
          </Button>
        ) : (
          <Button
            onClick={submitForm}
            disabled={input.length === 0}
            className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
          >
            <ArrowUpIcon size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}