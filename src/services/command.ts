import { MessageEvent } from "../types/event";
import { TextResponse } from "../types/respose";
import { getReport, handleFlow, startFlow } from "./flow";
import { listTeam } from "./users";

export async function handleCommand(event: MessageEvent): Promise<TextResponse> {
  switch (event.message.slashCommand?.commandId) {
    case "1":
      return await startFlow("STATUS_REPORT", event);
    case "2":
      return await listTeam();
    case "3":
      return await getReport("STATUS_REPORT", event.message.argumentText.trim().split(";"));
    default:
      return await handleFlow(event);
  }
}