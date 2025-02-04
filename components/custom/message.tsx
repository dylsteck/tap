/* eslint-disable @next/next/no-img-element */
'use client';

import { Attachment, ToolInvocation } from 'ai';
import { motion } from 'framer-motion';
import { User } from 'next-auth';
import { ReactNode } from 'react';

import { Markdown } from './markdown';
import { Tool, ToolPreview } from './tool';

export const Message = ({
  role,
  user,
  nextRole,
  content,
  toolInvocations,
  attachments,
  showDivider,
}: {
  role: string;
  user: User | undefined;
  nextRole: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
  showDivider?: boolean;
}) => {
  return (
    <motion.div
      className="w-full mb-6"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={role}
    >
      {role === 'user' && (
        <div className="flex flex-row gap-2 items-center mb-2">
          {user && (user as any).pfp_url ? 
          <img alt={`PFP: ${(user as any).pfp_url}`} src={(user as any).pfp_url} className="rounded-full size-6 border border-gray-300" />
          : null}
          <h2 className="text-lg font-medium break-words">{content}</h2>
        </div>
      )}
      {role === 'assistant' && (
        <div className="w-full space-y-4">
          {content ? (
            <div className="prose prose-invert max-w-none break-words">
              <Markdown>{content as string}</Markdown>
            </div>
          ) : null}
          {toolInvocations && toolInvocations.length > 0 && (
            <div className="flex flex-row gap-2 items-center overflow-hidden">
              {toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;
                if (state === 'result') {
                  const { result } = toolInvocation;
                  return (
                    <div key={toolCallId} className="overflow-x-auto">
                      <Tool result={result} toolName={toolName} />
                    </div>
                  );
                }
                return <ToolPreview key={toolCallId} />;
              })}
            </div>
          )}
        </div>
      )}
      {role === 'assistant' && nextRole === 'user' && (
        <hr className="mt-6 border-t border-white/10" />
      )}
    </motion.div>
  );
};