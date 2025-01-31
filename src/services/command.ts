import { MessageEvent, User } from "../types/event";
import { CardsResponse, TextResponse } from "../types/respose";
import { handleFlow } from "./flow";
import {
  getReportPrompt,
  getSchedulePrompt,
  getStatusPrompt,
  getUnschedulePrompt,
} from "./prompt";
import { isAdmin, listTeam } from "./users";

export async function handleCommand(
  event: MessageEvent,
): Promise<TextResponse | CardsResponse> {
  const {
    message: { slashCommand },
    user,
  } = event;

  switch (slashCommand?.commandId) {
    case "1":
      return await runForAdmin(user, getStatusPrompt);
    case "2":
      return await listTeam();
    case "3":
      return await getReportPrompt();
    case "4":
      return await runForAdmin(user, getSchedulePrompt);
    case "5":
      return await runForAdmin(user, getUnschedulePrompt);
    default:
      return await handleFlow(event);
  }
}

async function runForAdmin(user: User, op: () => Promise<CardsResponse>) {
  if (isAdmin(user.email)) {
    return await op();
  }

  return {
    text: "Unfortunately this command is available for administrators only.",
  };
}
