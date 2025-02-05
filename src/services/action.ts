import { CardClickedEvent } from "../types/event";
import { ReportFilter } from "../types/flow";
import { TextResponse } from "../types/respose";
import { getReport } from "./flow";
import {
  getAudience,
  getReportFilter,
  getSchedule,
  getTimezone,
} from "./prompt";
import { collectReports } from "./report";
import { scheduleReport, unscheduleReport } from "./scheduler";
import { setTimezone } from "./timezone";
import { getUser } from "./users";

export async function handleAction(
  event: CardClickedEvent,
): Promise<TextResponse> {
  switch (event.action.actionMethodName) {
    case "getStatus":
      return await runAction(event, getAudience, collectReports);
    case "getReport":
      return await runAction(event, getReportFilter, getStatusReport);
    case "activateSchedule":
      return await runAction(event, getSchedule, scheduleReport);
    case "deactivateSchedule":
      return await runAction(event, getAudience, unscheduleReport);
    case "setTimezone":
      return await setTimezone(event.user.email, getTimezone(event));
    default:
      return {
        text: `Unknown command '${event.action.actionMethodName}'`,
      };
  }
}

async function getStatusReport(
  filter: ReportFilter,
  timezone?: number,
): Promise<TextResponse> {
  return await getReport("STATUS_REPORT", filter, timezone);
}

async function runAction<Input>(
  event: CardClickedEvent,
  getInput: (event: CardClickedEvent) => Input,
  operator: (input: Input, timezone?: number) => Promise<TextResponse>,
) {
  const users = getAudience(event);
  if (users.length === 0) {
    return {
      text: "Some fellows must be chosen.",
    };
  }

  const sender = await getUser(event.user.email);
  if (!sender) {
    return {
      text: "You must be added to the system first.",
    };
  }

  const { timezone } = sender;

  const input = getInput(event);
  return await operator(input, timezone);
}
