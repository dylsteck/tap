import { CoreMessage, CoreToolMessage, generateId, Message, ToolInvocation } from "ai";
import { clsx, type ClassValue } from "clsx";
import { Session } from 'next-auth';
import { twMerge } from "tailwind-merge";

import { Chat } from "@/db/schema";

export const CAST_HASH_LENGTH = 42;

export const BANNER_IMG_URL = 'https://i.imgur.com/IufIWER.png';
export const VIDEOS_BANNER_IMG_URL = 'https://i.imgur.com/KMvTZXI.png';
export const ICON_IMG_URL = 'https://i.imgur.com/8Knijje.png';
export const USER_FALLBACK_IMG_URL = 'https://i.imgur.com/sosbyP2.png';

const isDev = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;
const localUrl = `http://localhost:${port}`;

export const BASE_URL = isDev ? localUrl : 'https://tap.computer';

export const CACHE_EX_SECONDS = 3600; // 1 hour

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const authMiddleware = (session: Session | null, url: Request['url'], headers: Request['headers']): Response | void => {
  // TODO: fix!! also the Response might need to be handled differently in the API routes
  // if (!session?.user) {
  //   const hostHeader = headers.get("host");
  //   const expectedHost = new URL(BASE_URL).host;
  //   if (hostHeader !== expectedHost) {
  //     return Response.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(url)}`, url));
  //   }
  // }
}

export const fetcher = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data."
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }
  const json = await res.json();
  return json;
};

export function formatPrice(price: number) {
  // examples: 50k, 52.4m, 1.2b
  // source: https://github.com/NickTikhonov/clankfun/blob/df31e7723478090c5c798e9399516be5e0c2bfc8/src/app/components/ClankerCard.tsx#L529
  if (price < 1000) {
    return price.toFixed(2);
  } else if (price < 1000000) {
    return (price / 1000).toFixed(2) + "k";
  } else if (price < 1000000000) {
    return (price / 1000000).toFixed(2) + "m";
  } else {
    return (price / 1000000000).toFixed(2) + "b";
  }
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolCallId,
          );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: "result",
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}

export function convertToUIMessages(
  messages: Array<CoreMessage>,
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === "tool") {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = "";
    let toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === "string") {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === "text") {
          textContent += content.text;
        } else if (content.type === "tool-call") {
          toolInvocations.push({
            state: "call",
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        }
      }
    }

    chatMessages.push({
      id: generateId(),
      role: message.role,
      content: textContent,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}

export function getTitleFromChat(chat: Chat) {
  const messages = convertToUIMessages(chat.messages as Array<CoreMessage>);
  const firstMessage = messages[0];

  if (!firstMessage) {
    return "Untitled";
  }

  return firstMessage.content;
}
