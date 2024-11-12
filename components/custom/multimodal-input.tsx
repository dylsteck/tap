'use client';

import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { motion } from 'framer-motion';
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { toast } from 'sonner';

import { ArrowUpIcon, StopIcon, RocketIcon } from './icons';
import useWindowSize from './use-window-size';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  messages,
  append,
  handleSubmit,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  messages: Array<Message>;
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
  const [autopilot, setAutopilot] = useState(false);

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

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [handleSubmit, width]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      <Textarea
        ref={textareaRef}
        placeholder="Where do you want to go?"
        value={input}
        onChange={handleInput}
        className="min-h-[24px] overflow-hidden resize-none p-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-muted border-none w-full rounded-xl"
        rows={1}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();

            if (isLoading) {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }
        }}
      />

      <div className="absolute bottom-2 right-2 flex space-x-2 items-center">
        <div className="flex flex-row gap-2 items-center pr-2">
          <Switch
            checked={autopilot}
            onCheckedChange={setAutopilot}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              autopilot ? 'bg-black dark:bg-gray-100' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`${
                autopilot ? 'translate-x-6 bg-blue-500' : 'translate-x-1 bg-white'
              } inline-block size-4 rounded-full transition-transform`}
            />
          </Switch>
          <div className="text-black dark:text-white mt-0.5">
            <RocketIcon size={16} />
          </div>
        </div>

        {isLoading ? (
          <Button
            className="rounded-full p-1.5 h-fit m-0.5"
            onClick={(event) => {
              event.preventDefault();
              stop();
            }}
          >
            <StopIcon size={14} />
          </Button>
        ) : (
          <Button
            className="rounded-full p-1.5 h-fit m-0.5"
            onClick={(event) => {
              event.preventDefault();
              submitForm();
            }}
            disabled={input.length === 0}
          >
            <ArrowUpIcon size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}