import { AddedToSpaceEvent } from "../types/event";
import { TextResponse } from "../types/respose";
import { getRef } from "./database";
import { getUser } from "./users";

export async function handleAddedToSpaceEvent(
  event: AddedToSpaceEvent,
): Promise<TextResponse> {
  const { space, user } = event;

  if (space.type === "DM") {
    const userRecord = await getUser(user.email);

    await getRef("users")
      .doc(user.email)
      .set({
        ...user,
        timezone: userRecord?.timezone ?? 0,
        space: event.space.name,
      });

    return { text: `Thanks for adding me to a DM, ${user.displayName}` };
  }

  return { text: `Thanks for adding me to ${space.displayName} space.` };
}
