import { TextResponse } from "../types/respose";
import { getRef } from "./database";
import { finishFlow, startFlow } from "./flow";
import { sendMessage } from "./message";

export async function handleReports(): Promise<TextResponse> {
  const time = getCurrentTime();

  await startSchedules(time);
  await finishSchedules(time);

  return {
    text: "Report requests were sent.",
  };
}

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

async function startSchedules(time: number) {
  const toStart = await getSchedulesToStart(time);
  if (toStart.length > 0) {
    const userIds = await getAudience(toStart);
    if (userIds.length > 0) {
      await toggleSchedules(toStart, true);
      await collectReports(userIds);
    }
  }
}

async function finishSchedules(time: number) {
  const toFinish = await getSchedulesToFinish(time);
  if (toFinish.length > 0) {
    const userIds = await getAudience(toFinish);
    if (userIds.length > 0) {
      await toggleSchedules(toFinish, false);
      await finalizeReports(userIds);
    }
  }
}

async function toggleSchedules(scheduleIds: string[], isActivated: boolean) {
  scheduleIds.forEach(async (id) => {
    await getRef("schedules").doc(id).update({
      isActivated,
    });
  });
}

async function getSchedulesToStart(time: number) {
  const result: string[] = [];
  const schedules = await getRef("schedules")
    .where("start", "<=", time)
    .where("finish", ">", time)
    .where("isActivated", "==", false)
    .get();

  schedules.forEach((doc) => {
    result.push(doc.id);
  });

  return result;
}

async function getSchedulesToFinish(time: number) {
  const result: string[] = [];
  const schedules = await getRef("schedules")
    .where("finish", "<=", time)
    .where("isActivated", "==", true)
    .get();

  schedules.forEach((doc) => {
    result.push(doc.id);
  });

  return result;
}

async function getAudience(scheduleIds: string[]) {
  const result: string[] = [];
  const users = await getRef("userSchedule")
    .where("scheduleId", "in", scheduleIds)
    .get();

  users.forEach((doc) => {
    result.push(doc.id);
  });

  return result;
}

async function finalizeReports(userIds: string[]): Promise<void> {
  const actions = userIds.map((userId) => finishFlow(userId));

  await Promise.all(actions);
}

function getCurrentTime(): number {
  const now = new Date();
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();

  return 60 * hours + minutes;
}
