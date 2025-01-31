import { TextResponse } from "../types/respose";
import { finishFlow, startFlow } from "./flow";
import { sendMessage } from "./message";

export async function collectReports(userIds: string[]): Promise<TextResponse> {
  const actions = userIds.map((userId) => {
    return (async (userId: string) => {
      const { text } = await startFlow("STATUS_REPORT", userId);
      await sendMessage({
        text,
        userId,
      });
    })(userId);
  });

  await Promise.all(actions);

  return {
    text: "Report requests were sent.",
  };
}

export async function finalizeReports(userIds: string[]) {
  const actions = userIds.map((userId) => {
    return (async (userId: string) => {
      await finishFlow(userId);
    })(userId);
  });

  await Promise.all(actions);
}
