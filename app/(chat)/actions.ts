"use server";

import { generateText, type Message } from "ai";
import { cookies } from "next/headers";

import type { VisibilityType } from "@/components/visibility-selector";
import { customModel } from "@/lib/ai";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  saveMessages,
  updateChatVisiblityById,
} from "@/lib/db/queries";
import { DEFAULT_MODEL_NAME } from "@/lib/ai/models";

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("model-id", model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  const { text: title } = await generateText({
    model: customModel(DEFAULT_MODEL_NAME),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

export async function updateMessages(chatId: string, messages: Message[]) {
  await saveMessages({
    messages: messages.map((message) => ({
      chatId,
      content: message.content,
      createdAt: message.createdAt ?? new Date(),
      id: message.id,
      role: message.role,
    })),
  });
}
