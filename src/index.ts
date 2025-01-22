import { Request, Response } from "@google-cloud/functions-framework";
import { ChatEvent } from "./types/event";
import { ChatResponse } from "./types/respose";

import { handleAddedToSpaceEvent } from "./services/space";
import { handleCommand } from "./services/command";

export async function chatBot(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.send(`Hello, World`);
  }

  const event = req.body as ChatEvent;
  let resp: ChatResponse = { text: 'Hello, World' };
  switch (event.type) {
    case 'ADDED_TO_SPACE':
      resp = await handleAddedToSpaceEvent(event);
      return res.json(resp);
    case 'MESSAGE':
      resp = await handleCommand(event);
      return res.json(resp);
    default:
      return res.json(resp);
  }
}
