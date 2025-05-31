import { MODEL_NAME } from '@tap/common';
import { TapSDK } from '@tap/sdk';
import { CoreMessage } from 'ai';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { ChatProfileId } from '@/lib/types';
import { convertToUIMessages } from '@/lib/utils';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const { id } = params;
  
  const sdk = TapSDK.getInstance();
  const chatFromDb = await sdk.getChatById(id);

  if (!chatFromDb) {
    notFound();
  }

  // type casting
  const chat = {
    ...chatFromDb,
    messages: convertToUIMessages(chatFromDb.messages as Array<CoreMessage>)
  };

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  return (
    <Chat
      id={chat.id}
      user={session?.user}
      initialMessages={chat.messages}
      selectedModelName={MODEL_NAME}
    />
  );
}
