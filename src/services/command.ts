import { MessageEvent } from "../types/event";
import { handleFlow, startFlow } from "./flow";

export async function handleCommand(event: MessageEvent) {
  if (event.message.slashCommand?.commandId === '1') {
    return await startFlow("STATUS_REPORT", event);
  }

  return await handleFlow(event);
}