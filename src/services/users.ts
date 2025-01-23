import { getRef } from "./database";

export async function listTeam() {
  const users = await getRef("users").get();

  const text = users.docs.map(doc => {
    const data = doc.data();
    return `* ${data.displayName} (${data.email})`;
  }).join("\n");

  return { text: `The team:\n${text}` };
}
