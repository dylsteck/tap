import { CoreMessage } from 'ai';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/custom/chat';
import { getChatById } from '@/db/queries';
import { Chat as ChatSchema } from '@/db/schema';
import { MODEL_NAME } from '@/lib/model';
import { ChatProfileId } from '@/lib/types';
import { convertToUIMessages } from '@/lib/utils';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const { id } = params;
  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) {
    notFound();
  }

  // type casting
  const chat: ChatSchema = {
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
      initialProfile={chat.profile as ChatProfileId}
      selectedModelName={MODEL_NAME}
    />
  );
}
