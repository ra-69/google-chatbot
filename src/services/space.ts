import { AddedToSpaceEvent } from "../types/event";
import { TextResponse } from "../types/respose";
import { getRef } from "./database";

export async function handleAddedToSpaceEvent(
  event: AddedToSpaceEvent,
): Promise<TextResponse> {
  if (event.space.type === "DM") {
    const { user } = event;
    const ref = getRef("users");
    const userRecord = (await ref.doc(user.email).get()).data();

    if (!userRecord) {
      await ref.doc(user.email).set(user);
    }

    return { text: `Thanks for adding me to a DM, ${event.user.displayName}` };
  }

  return { text: `Thanks for adding me to ${event.space.displayName} space.` };
}
