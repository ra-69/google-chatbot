import { config } from "../config/flow";
import { MessageEvent } from "../types/event";
import { FlowStep, FlowType, ReportFilter } from "../types/flow";
import { TextResponse } from "../types/respose";
import { getTimestamp, toDate } from "../utils/time";
import { getRef } from "./database";

export async function startFlow(flow: FlowType, event: MessageEvent): Promise<TextResponse> {
  const userId = event.user.email;
  await getRef('flows').doc(userId).set({
    userId,
    activeFlow: flow,
    currentStep: 0,
    createdAt: getTimestamp(new Date().getTime()),
  });

  const def = config[flow];

  if (def.length === 0) {
    return { text: 'Invalid configuration' };
  }

  const { prompt: text } = def[0];
  return { text };
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
    createdAt
  });

  if (currentStep >= def.length - 1) {
    await getRef("flows").doc(userId).delete();

    return { text: "Thank you. Have a wonderful day!" };
  }

  await getRef("flows").doc(userId).set({
    userId,
    activeFlow,
    currentStep: currentStep + 1,
    createdAt
  });

  return { text: def[currentStep + 1].prompt };
}

export async function getReport(flow: FlowType, { userIds, from, to }: ReportFilter): Promise<TextResponse> {

  const map: { [userId: string]: {
    [createdAt: string]: {
      [Step in FlowStep<FlowType>]?: string;
    }
  } } = {};

  const reports = await getRef("reports")
    .where("type", "==", flow)
    .where("createdAt", ">=", from)
    .where("createdAt", "<=", to)
    .where("userId", "in", userIds)
    .get();

  if (reports.empty) {
    return { text : "No reports found" };
  }

  reports.docs.forEach(doc => {
    const {reply, userId, step, createdAt } = doc.data();
    if (!map[userId]) {
      map[userId] = {};
    }

    if (!map[userId][createdAt]) {
      map[userId][createdAt] = {};
    }

    map[userId][createdAt][step] = reply; 
  });

  const report = userIds.map(userId => {
    const userReport = map[userId];

    const report = Object.keys(userReport).map(createdAt => {
      const steps = userReport[createdAt];

      const report = config[flow].map(({step, name}) => {
        return `*${name}*\n${steps[step] ? steps[step] : "No reply"}`;
      });

      return `_${toDate(parseInt(createdAt)).toUTCString()}_\n${report.join("\n")}`;
    });

    return `*${userId}*\n${report.join("\n")}`;
  });

  return { text: report.join("\n") };
}
