import { Request, Response } from "@google-cloud/functions-framework";

export async function chatBot(req: Request, res: Response) {
    if (req.method === 'POST') {
        let text = '';

        if (req.body.type === 'ADDED_TO_SPACE' && req.body.space.type === 'ROOM') {
            // Case 1: When App was added to the ROOM
            text = `Thanks for adding me to ${req.body.space.displayName}`;
        } else if (req.body.type === 'ADDED_TO_SPACE' &&
            // Case 2: When App was added to a DM
            req.body.space.type === 'DM') {
            text = `Thanks for adding me to a DM, ${req.body.user.displayName}`;
        } else if (req.body.type === 'MESSAGE') {
            // Case 3: Texting the App
            text = `Your message : ${req.body.message.text}`;
        }
        return res.json({text});
    }
    res.send(`Hello, World`);
}
