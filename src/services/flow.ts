import { config } from "../config/flow";
import { MessageEvent } from "../types/event";
import { FlowType, ReportFilter, ReportMap } from "../types/flow";
import { TextResponse } from "../types/respose";
import { User } from "../types/user";
import { getTimestamp, toDate } from "../utils/time";
import { getRef } from "./database";
import { sendMessage } from "./message";
import { getAdmins, getUsersMap } from "./users";

export async function startFlow(
  flow: FlowType,
  userId: string,
): Promise<TextResponse> {
  await getRef("flows")
    .doc(userId)
    .set({
      userId,
      activeFlow: flow,
      currentStep: 0,
      createdAt: getTimestamp(new Date().getTime()),
    });

  const def = config[flow];

  if (def.length === 0) {
    return { text: "Invalid configuration" };
  }

  const { prompt: text } = def[0];
  return { text };
}

export async function finishFlow(
  userId: string,
  message = "Unfortunately the time assigned to fill the report is elapsed.",
): Promise<void> {
  const current = (await getRef("flows").doc(userId).get()).data();

  if (current) {
    await getRef("flows").doc(userId).delete();
    sendMessage({ text: message, userId });
    const { activeFlow: flow, createdAt } = current;

    notifyAdmins({
      flow,
      userId,
      createdAt,
      missedReportMessage: "Did not reply.",
      subtitle: "Failed to complete reporting in the assigned time.",
    });
  }
}

export async function handleFlow(event: MessageEvent): Promise<TextResponse> {
  const userId = event.user.email;

  const flow = (await getRef("flows").doc(userId).get()).data();

  if (!flow) {
    return { text: "Flow in not active" };
  }

  const { activeFlow, currentStep, createdAt } = flow;
  const def = config[activeFlow];

  if (!def) {
    return { text: "Invalid flow" };
  }

  await getRef("reports").add({
    userId,
    type: activeFlow,
    step: def[currentStep].step,
    reply: event.message.formattedText,
    createdAt,
  });

  if (currentStep >= def.length - 1) {
    await getRef("flows").doc(userId).delete();

    notifyAdmins({
      flow: activeFlow,
      userId,
      createdAt,
      missedReportMessage: "Did not reply.",
      subtitle: "Submitted report.",
    });

    return { text: "Thank you. Have a wonderful day!" };
  }

  await getRef("flows")
    .doc(userId)
    .set({
      userId,
      activeFlow,
      currentStep: currentStep + 1,
      createdAt,
    });

  return { text: def[currentStep + 1].prompt };
}

async function getReportContent({
  flow,
  userIds,
  map,
  users,
  timezone = 0,
  missedReportMessage = "Did not reply.",
  subtitle = "",
}: {
  flow: FlowType;
  userIds: string[];
  map: ReportMap;
  users: { [userId: string]: User };
  timezone?: number;
  missedReportMessage?: string;
  subtitle?: string;
}): Promise<TextResponse> {
  const report = userIds.map((userId) => {
    const userReport = map[userId];

    if (!userReport) {
      return `*${users[userId].displayName}*\n_${missedReportMessage}_\n`;
    }

    const report = Object.keys(userReport).map((createdAt) => {
      const steps = userReport[createdAt];

      const report = config[flow].map(({ step, name }) => {
        return `*${name}*\n${steps[step] ? steps[step] : "No reply"}\n`;
      });

      const date = toDate(parseInt(createdAt));
      const timeZone = `${timezone >= 0 ? "+" : ""}${timezone.toString().padStart(2, "0")}:00`;
      const dateStamp = date.toLocaleDateString("en-US", { timeZone });
      const timeStamp = date.toLocaleTimeString("en-US", { timeZone });

      return `_${dateStamp} ${timeStamp}_\n${report.join("\n")}`;
    });

    return `*${users[userId].displayName}*\n\n${subtitle ? `${subtitle}\n` : ""}${report.join("\n")}`;
  });

  return { text: report.join("\n") };
}

export async function getReport(
  flow: FlowType,
  filter: ReportFilter,
  timezone = 0,
  missedReportMessage = "Did not reply.",
  subtitle = "",
): Promise<TextResponse> {
  const [users, map] = await Promise.all([
    getUsersMap(),
    getReportMap(flow, filter),
  ]);

  return await getReportContent({
    flow,
    userIds: filter.userIds,
    map,
    users,
    timezone,
    missedReportMessage,
    subtitle,
  });
}

async function getReportMap(
  flow: FlowType,
  { userIds, from, to }: ReportFilter,
): Promise<ReportMap> {
  const map: ReportMap = {};
  const reports = await getRef("reports")
    .where("type", "==", flow)
    .where("createdAt", ">=", from)
    .where("createdAt", "<=", to)
    .where("userId", "in", userIds)
    .get();

  reports.docs.forEach((doc) => {
    const { reply, userId, step, createdAt } = doc.data();
    if (!map[userId]) {
      map[userId] = {};
    }

    if (!map[userId][createdAt]) {
      map[userId][createdAt] = {};
    }

    map[userId][createdAt][step] = reply;
  });

  return map;
}

async function notifyAdmins({
  flow,
  createdAt,
  userId,
  missedReportMessage,
  subtitle,
}: {
  flow: FlowType;
  userId: string;
  createdAt: number;
  missedReportMessage?: string;
  subtitle?: string;
}): Promise<void> {
  const to = getTimestamp(new Date().getTime());

  const [users, map] = await Promise.all([
    getUsersMap(),
    getReportMap(flow, {
      userIds: [userId],
      from: createdAt,
      to,
    }),
  ]);

  const actions = getAdmins()
    .filter((adminId) => adminId !== userId)
    .map((adminId) => {
      return (async (adminId: string) => {
        const { timezone } = users[userId];
        const { text } = await getReportContent({
          flow,
          userIds: [userId],
          map,
          users,
          timezone,
          missedReportMessage,
          subtitle,
        });

        await sendMessage({
          text,
          userId: adminId,
        });
      })(adminId);
    });

  Promise.all(actions);
}
