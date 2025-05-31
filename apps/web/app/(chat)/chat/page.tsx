import { generateUUID, MODEL_NAME } from '@tap/common';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';

export default async function Page() {
  const id = generateUUID();
  const session = await auth();

  return (
    <Chat
      key={id}
      id={id}
      initialMessages={[]}
      user={session?.user}
      selectedModelName={MODEL_NAME}
    />
  );
}