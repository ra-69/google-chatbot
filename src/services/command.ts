import { MessageEvent, User } from "../types/event";
import { CardsResponse, TextResponse } from "../types/respose";
import { handleFlow } from "./flow";
import {
  getReportPrompt,
  getSchedulePrompt,
  getStatusPrompt,
  getTimezonePrompt,
  getUnschedulePrompt,
} from "./prompt";
import { getUser, isAdmin, listTeam } from "./users";

export async function handleCommand(
  event: MessageEvent,
): Promise<TextResponse | CardsResponse> {
  const {
    message: { slashCommand },
    user,
  } = event;

  switch (slashCommand?.commandId) {
    case "1":
      return await run(user, getStatusPrompt);
    case "2":
      return await run(user, listTeam, false);
    case "3":
      return await run(user, getReportPrompt, false);
    case "4":
      return await run(user, getSchedulePrompt);
    case "5":
      return await run(user, getUnschedulePrompt);
    case "6":
      return await getTimezonePrompt(user.email);
    default:
      return await handleFlow(event);
  }
}

async function run(
  user: User,
  op: (timezone: number) => Promise<CardsResponse>,
  forAdmin = true,
) {
  if (!forAdmin || isAdmin(user.email)) {
    const current = await getUser(user.email);

    if (!current) {
      return {
        text: "You must be added to the system first.",
      };
    }

    return await op(current.timezone ?? 0);
  }

  return {
    text: "Unfortunately this command is available for administrators only.",
  };
}
