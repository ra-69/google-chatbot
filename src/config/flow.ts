import { FlowConfig } from "../types/flow";

export const config: FlowConfig = {
  STATUS_REPORT: [
    {
      step: 'DONE',
      prompt: 'What did you accomplish today?'
    },
    {
      step: 'IN_PROGRESS',
      prompt: 'What are you working on tomorrow?'
    },
    {
      step: 'BLOCKERS',
      prompt: 'Are you blocked on anything?'
    }
  ]
};
