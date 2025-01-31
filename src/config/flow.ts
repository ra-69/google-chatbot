import { FlowConfig } from "../types/flow";

export const config: FlowConfig = {
  STATUS_REPORT: [
    {
      step: "DONE",
      name: "Done",
      prompt: "What did you accomplish today?",
    },
    {
      step: "IN_PROGRESS",
      name: "In Progress",
      prompt: "What are you working on tomorrow?",
    },
    {
      step: "BLOCKERS",
      name: "Blockers",
      prompt: "Are you blocked on anything?",
    },
  ],
};
