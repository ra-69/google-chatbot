import { CardClickedEvent } from "../types/event";
import { TextResponse } from "../types/respose";
import { getReport } from "./flow";
import { getReportFilter } from "./prompt";

export async function handleAction(event: CardClickedEvent): Promise<TextResponse> {
  const filter = getReportFilter(event);
  return await getReport("STATUS_REPORT", filter);
}