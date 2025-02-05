export type Schedule = UsersContext & {
  start: Time;
  finish: Time;
};

export type Unschedule = UsersContext;

export type Time = {
  hours?: number;
  minutes?: number;
};

export type ScheduleMap = {
  [time: string]: Job & UsersContext;
};

export type UsersMap = {
  [userId: string]: Job & TimeContext;
};

export type Kind = "start" | "finish";
export type KindContext = {
  kind: Kind;
};

export type Job = {
  name: string;
} & KindContext;

export type UsersContext = {
  userIds: string[];
};

export type TimeContext = {
  time: string;
};
