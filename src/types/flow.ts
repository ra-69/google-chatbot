export type StatusReport = {
  type: "STATUS_REPORT";
  step: "DONE" | "IN_PROGRESS" | "BLOCKERS";
  reply: string;
  createdAt: number;
};

export type Flow = StatusReport;
export type FlowType = Flow["type"];

export type FlowConfig = {
  [T in FlowType]: FlowStepConfig<T>[];
};

export type FlowStepConfig<T extends FlowType> = {
  step: FlowStep<T>;
  prompt: string;
  name: string;
};

export type FlowStep<T extends FlowType> = T extends "STATUS_REPORT"
  ? StatusReport["step"]
  : never;

export type FlowState = {
  userId: string;
  activeFlow: FlowType;
  currentStep: number;
  createdAt: number;
};

export type ReportFilter = {
  userIds: string[];
  from: number;
  to: number;
};
