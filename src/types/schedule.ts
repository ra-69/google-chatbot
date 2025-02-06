export type Schedule = {
  start: Time;
  finish: Time;
} & UsersContext;

export type Unschedule = UsersContext;
export type UsersContext = {
  userIds: string[];
};

export type Time = {
  hours?: number;
  minutes?: number;
};

export type ScheduleContext = {
  start: Required<Time>;
  finish: Required<Time>;
};

export type UsersSchedule = {
  [userId: string]: ScheduleContext;
};

export type MainJob = {
  name: "main";
  schedule: "* * * * 1-5";
};

export type RecycleJob = {
  name: "recycle";
  schedule: "*/5 * * * 1-5";
};

export type Job = MainJob | RecycleJob;

export type ScheduleRecord = {
  start: number;
  finish: number;
  isActivated: boolean;
};

export type UserScheduleRecord = {
  userId: string;
  scheduleId: string;
};
