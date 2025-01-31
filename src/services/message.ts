import { auth, chat, chat_v1 } from "@googleapis/chat";
import { Message } from "../types/message";

let client: chat_v1.Chat | undefined;

async function getClient() {
  if (client) {
    return client;
  }

  const chatAuth = new auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/chat.bot"],
  });

  // Create the Chat API client and authenticate with the service account.
  client = chat({
    version: "v1",
    auth: chatAuth,
  });

  return client;
}

export async function getSpaces() {
  const client = await getClient();
  return await client.spaces.list();
}

export async function sendMessage({ text, userId }: Message) {
  const client = await getClient();

  return await client.spaces.messages.create({
    parent: process.env.PARENT_MSG,
    requestBody: {
      text,
      privateMessageViewer: {
        name: `users/${userId}`,
      },
    },
  });
}
