import { Chat } from '@/components/custom/chat';
import { MODEL_NAME } from '@/lib/model';
import { generateUUID } from '@/lib/utils';

import { auth } from '../(auth)/auth';

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