import { MessageEvent } from "../types/event";
import { CardsResponse, TextResponse } from "../types/respose";
import { handleFlow, startFlow } from "./flow";
import { getReportPrompt } from "./prompt";
import { listTeam } from "./users";

export async function handleCommand(event: MessageEvent): Promise<TextResponse | CardsResponse> {
  const { message: { slashCommand }} = event;

  switch (slashCommand?.commandId) {
    case "1":
      return await startFlow("STATUS_REPORT", event);
    case "2":
      return await listTeam();
    case "3":
      return await getReportPrompt();
    default:
      return await handleFlow(event);
  }
}