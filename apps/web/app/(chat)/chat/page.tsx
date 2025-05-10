import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/custom/chat';
import { MODEL_NAME } from '@/lib/model';
import { generateUUID } from '@/lib/utils';

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