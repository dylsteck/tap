import { auth } from "@/app/(auth)/auth";
import { deleteChatsByUserId, getChatsByUserId } from "@/db/queries";

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json("Unauthorized!", { status: 401 });
  }

  const chats = await getChatsByUserId({ id: session.user.id! });
  return Response.json(chats);
}

export async function DELETE() {
  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await deleteChatsByUserId({ id: session.user.id! });
    return new Response('Chat history deleted successfully', { status: 200 });
  } catch (error) {
    return new Response('Failed to delete chat history', { status: 500 });
  }
}
