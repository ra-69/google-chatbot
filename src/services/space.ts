import { AddedToSpaceEvent } from "../types/event";
import { TextResponse } from "../types/respose";
import { getEntity, setEntity } from "./database";

export async function handleAddedToSpaceEvent(event: AddedToSpaceEvent): Promise<TextResponse> {
  if (event.space.type === 'DM') {
    const { user } = event;
    const userRecord = await getEntity('users', user.email);

    if (!userRecord) {
      await setEntity('users', user.email, user);
    }

    return { text: `Thanks for adding me to a DM, ${event.user.displayName}`};
  }
  
  return {text: `Thanks for adding me to ${event.space.displayName}`};
}
