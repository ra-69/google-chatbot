import { AddedToSpaceEvent } from "../types/event";
import { TextResponse } from "../types/respose";
import { getRef } from "./database";
import { getUser } from "./users";

export async function handleAddedToSpaceEvent(
  event: AddedToSpaceEvent,
): Promise<TextResponse> {
  if (event.space.type === "DM") {
    const { user } = event;
    const ref = getRef("users");
    const userRecord = await getUser(user.email);

    if (!userRecord) {
      await ref.doc(user.email).set({
        ...user,
        timezone: 0,
      });
    }

    return { text: `Thanks for adding me to a DM, ${event.user.displayName}` };
  }

  return { text: `Thanks for adding me to ${event.space.displayName} space.` };
}
