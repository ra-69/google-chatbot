import { CardClickedEvent } from "../types/event";
import { TextResponse } from "../types/respose";
import { getReport } from "./flow";
import { getReportFilter, getSchedule } from "./prompt";
import { collectReports } from "./report";
import { scheduleReport, unscheduleReport } from "./scheduler";
import { getAudience } from "./users";

export async function handleAction(
  event: CardClickedEvent,
): Promise<TextResponse> {
  switch (event.action.actionMethodName) {
    case "getStatus":
      return await runAction(event, getAudience, collectReports);
    case "getReport":
      return await runAction(event, getReportFilter, async (filter) => {
        return await getReport("STATUS_REPORT", filter);
      });
    case "activateSchedule":
      return await runAction(event, getSchedule, scheduleReport);
    case "deactivateSchedule":
      return await runAction(event, getAudience, unscheduleReport);
    default:
      return {
        text: `Unknown command '${event.action.actionMethodName}'`,
      };
  }
}

async function runAction<Input>(
  event: CardClickedEvent,
  getInput: (event: CardClickedEvent) => Input,
  operator: (input: Input) => Promise<TextResponse>,
) {
  const users = getAudience(event);
  if (users.length === 0) {
    return {
      text: "Some fellows must be chosen.",
    };
  }

  const input = getInput(event);
  return await operator(input);
}
