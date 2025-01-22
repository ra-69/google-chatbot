import { config } from "../config/flow";
import { MessageEvent } from "../types/event";
import { FlowType } from "../types/flow";
import { TextResponse } from "../types/respose";
import { addEntity, getEntity, setEntity } from "./database";

export async function startFlow(flow: FlowType, event: MessageEvent): Promise<TextResponse> {
  const userId = event.user.email;
  await setEntity('flows', userId, {
    userId,
    activeFlow: flow,
    currentStep: 0,
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

  const flow = await getEntity('flows', userId);

  if (!flow || !flow.activeFlow || flow.currentStep === undefined) {
    return { text: 'Flow in not active' };
  }

  const { activeFlow, currentStep } = flow;
  const def = config[activeFlow];

  if (!def) {
    return { text: 'Invalid flow' };
  }

  await addEntity('reports', {
    userId,
    type: activeFlow,
    step: def[currentStep].step,
    reply: event.message.text,
  });

  if (currentStep >= def.length - 1) {
    await setEntity('flows', userId, {
      userId
    });

    return { text: 'Thank you!' };
  }

  await setEntity('flows', userId, {
    userId,
    activeFlow,
    currentStep: currentStep + 1,
  });

  return { text: def[currentStep + 1].prompt };
}