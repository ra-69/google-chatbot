import { MessageEvent } from "../types/event";
import { TextResponse } from "../types/respose";
import { getReport, handleFlow, startFlow } from "./flow";
import { listTeam } from "./users";

export async function handleCommand(event: MessageEvent): Promise<TextResponse> {
  const { message: { slashCommand, argumentText }} = event;

  switch (slashCommand?.commandId) {
    case "1":
      return await startFlow("STATUS_REPORT", event);
    case "2":
      return await listTeam();
    case "3":
      if (!argumentText?.trim()) {
        return { text: "Please specify email list of your fellows as an argument of the command. Use semicolon as a separator. E.g.:\n*/report a.silchankau@softteco.com;r.navarych@softteco.com*"};
      }

      return await getReport("STATUS_REPORT", argumentText.trim().split(";"));
    default:
      return await handleFlow(event);
  }
}