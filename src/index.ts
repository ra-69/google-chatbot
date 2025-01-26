import { Request, Response } from "@google-cloud/functions-framework";
import { ChatEvent } from "./types/event";
import { ChatResponse } from "./types/respose";

import { handleAddedToSpaceEvent } from "./services/space";
import { handleCommand } from "./services/command";
import { handleAction } from "./services/action";

export async function chatBot(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.send(`Hello, World`);
  }

  const event = req.body as ChatEvent;
  let resp: ChatResponse = { text: 'Hello, World' };
  switch (event.type) {
    case "ADDED_TO_SPACE":
      resp = await handleAddedToSpaceEvent(event);
      return res.json(resp);
    case "MESSAGE":
      resp = await handleCommand(event);
      return res.json(resp);
    case "CARD_CLICKED":
      resp = await handleAction(event);
      return res.json(resp);
    default:
      return res.json(resp);
  }
}
