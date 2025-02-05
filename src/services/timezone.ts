import { TextResponse } from "../types/respose";
import { getRef } from "./database";

export async function setTimezone(
  userId: string,
  timezone: number,
): Promise<TextResponse> {
  await getRef("users").doc(userId).update({ timezone });
  return { text: "Timezone has been set." };
}
