'use client';
import { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { User } from 'next-auth';
import { useState, useEffect, useRef } from 'react';

import { Message as PreviewMessage } from '@/components/custom/message';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { ChatProfileId } from '@/lib/types';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { Overview } from './overview';

export function Chat({
  id,
  initialMessages,
  initialProfile,
  user,
  selectedModelName,
}: {
  id: string;
  initialMessages: Array<Message>;
  initialProfile?: ChatProfileId;
  user: User | undefined;
  selectedModelName: string;
}) {
  const [profile, setProfile] = useState<ChatProfileId>(initialProfile && initialProfile.length > 0 ? initialProfile : 'farcaster');
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      body: { id, profile, model: selectedModelName },
      initialMessages,
      onFinish: () => {
        window.history.replaceState({}, '', `/chat/${id}`);
      },
    });

  const [containerRef, endRef] = useScrollToBottom(messages);
  return (
    <div className="flex flex-col w-screen h-dvh bg-background overflow-hidden border-0">
      <ChatHeader user={user} />
      <main className="flex-1 w-full md:!w-2/3 md:mx-auto overflow-y-auto" ref={containerRef}>
        <div className="w-full md:mx-auto px-5 md:px-3">
          {messages.length === 0 && <Overview />}
          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              role={message.role}
              user={user}
              nextRole={messages[index + 1] ? messages[index + 1].role : ""}
              content={message.content}
              attachments={message.experimental_attachments}
              toolInvocations={message.toolInvocations}
            />
          ))}
          <div ref={endRef} />
        </div>
      </main>
      <footer className="w-full md:!w-2/3 md:mx-auto bg-background">
        <div className="w-full">
          {/* {messages.length === 0 && (
            <div className="pb-2">      
              <SuggestedActions 
                onActionSelect={(action) => {
                  append({
                    role: 'user',
                    content: action,
                  });
                }} 
              />
            </div>
          )} */}
          <div className="w-full bg-background p-3">
            <form onSubmit={handleSubmit}>
              <ChatInput
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                stop={stop}
                messages={messages}
                profile={profile}
                setProfile={setProfile}
                append={append}
                handleSubmit={handleSubmit}
              />
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}