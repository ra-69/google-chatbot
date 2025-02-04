import { CloudSchedulerClient, protos } from "@google-cloud/scheduler";
import { CollectReportEvent } from "../types/event";
import {
  Job,
  Kind,
  KindContext,
  Schedule,
  ScheduleMap,
  Time,
  TimeContext,
  UsersContext,
  UsersMap,
} from "../types/schedule";
import { TextResponse } from "../types/respose";

type IJob = protos.google.cloud.scheduler.v1.IJob;
type IHttpTarget = protos.google.cloud.scheduler.v1.IHttpTarget;

let client: CloudSchedulerClient | undefined;

function getClient() {
  if (client) {
    return client;
  }

  client = new CloudSchedulerClient();
  return client;
}

export async function scheduleReport({
  userIds,
  start,
  finish,
}: Schedule): Promise<TextResponse> {
  if (getMinutes(start) >= getMinutes(finish)) {
    return {
      text: "Start time should be greater than finish time.",
    };
  }

  Promise.all([
    activateSchedule({
      userIds,
      time: start,
      kind: "start",
    }),
    activateSchedule({
      userIds,
      time: finish,
      kind: "finish",
    }),
  ]);

  return {
    text: "Schedule is activated.",
  };
}

async function activateSchedule({
  userIds,
  time,
  kind,
}: {
  userIds: string[];
  time: Time;
  kind: Kind;
}): Promise<void> {
  const { minutes, hours } = time;
  const schedule = `${minutes} ${hours} * * 1-5`;
  const jobs = await getJobs();
  const schedules = await getScheduleMap(jobs);
  const users = await getUsersMap(kind, jobs);
  const updated = new Set<string>();
  const created = new Set<string>();

  const scheduleUser = (userId: string) => {
    if (!schedules[schedule]) {
      schedules[schedule] = {
        name: "",
        userIds: [userId],
        kind,
      };

      created.add(schedule);
    } else {
      schedules[schedule].userIds.push(userId);

      if (!created.has(schedule)) {
        updated.add(schedule);
      }
    }
  };

  userIds.forEach((userId) => {
    const job = users[userId];
    if (job) {
      const { time } = job;
      if (time !== schedule) {
        const { userIds } = schedules[time];
        userIds.splice(userIds.indexOf(userId), 1);
        updated.add(time);
        scheduleUser(userId);
      }
    } else {
      scheduleUser(userId);
    }
  });

  const client = getClient();

  if (updated.size > 0) {
    await Promise.all(
      [...updated].map((time) => {
        const { name, userIds, kind } = schedules[time];
        if (userIds.length === 0) {
          return client.deleteJob({
            name,
          });
        } else {
          return client.updateJob({
            job: {
              name,
              schedule: time,
              httpTarget: getHttpTarget(userIds, kind),
            },
          });
        }
      }),
    );
  }

  if (created.size > 0) {
    await Promise.all(
      [...created].map((time) => {
        const { userIds, kind } = schedules[time];
        return client.createJob({
          parent: process.env.PARENT,
          job: {
            schedule: time,
            httpTarget: getHttpTarget(userIds, kind),
          },
        });
      }),
    );
  }
}

export async function unscheduleReport(
  userIds: string[],
): Promise<TextResponse> {
  const actions = [
    deactivateSchedule(userIds, "start"),
    deactivateSchedule(userIds, "finish"),
  ];

  await Promise.all(actions);
  return {
    text: "Schedules were disabled.",
  };
}

async function deactivateSchedule(
  userIds: string[],
  kind: Kind,
): Promise<void> {
  const scheduleMap = await getScheduleMap();
  const schedules: (Job & UsersContext & TimeContext)[] = Object.entries(
    scheduleMap,
  ).map(([time, job]) => ({ ...job, time }));
  const updates: (Job & UsersContext & TimeContext)[] = [];

  userIds.forEach((userId) => {
    let update = updates.find(({ userIds }) => userIds.includes(userId));

    if (!update) {
      const index = schedules.findIndex(
        ({ userIds, kind: scheduleKind }) =>
          userIds.includes(userId) && scheduleKind === kind,
      );

      if (index !== -1) {
        update = schedules.splice(index, 1)[0];
        updates.push(update);
      }
    }

    if (update) {
      const { userIds } = update;
      const index = userIds.indexOf(userId);
      userIds.splice(index, 1);
    }
  });

  if (updates.length === 0) {
    return;
  }

  const client = getClient();
  const actions = updates.map((update) => {
    const { userIds, name, time: schedule, kind } = update;
    if (userIds.length > 0) {
      return client.updateJob({
        job: {
          name,
          schedule,
          httpTarget: getHttpTarget(userIds, kind),
        },
      });
    } else {
      return client.deleteJob({
        name,
      });
    }
  });

  await Promise.all(actions);
}

export async function getScheduleList(): Promise<TextResponse> {
  const schedules = await getScheduleMap();

  const result = Object.entries(schedules).map(([time, job]) => {
    const users = job.userIds.map((userId) => `- ${userId}`);
    return `*${time}*\n${users.join("\n")}`;
  });

  return { text: result.join("\n") };
}

export async function getUsersMap(
  type: Kind,
  jobs?: IJob[],
): Promise<UsersMap> {
  const result: UsersMap = {};

  iterateSchedule(
    ({ time, name, userIds, kind }) => {
      if (kind === type) {
        userIds.forEach((userId) => {
          result[userId] = {
            time,
            name,
            kind,
          };
        });
      }
    },
    jobs ?? (await getJobs()),
  );

  return result;
}

function getHttpTarget(userIds: string[], kind: Kind): IHttpTarget {
  const payload: CollectReportEvent = {
    type: "COLLECT_REPORTS",
    userIds,
    kind,
  };

  return {
    uri: process.env.HOST,
    headers: {
      "Content-Type": "application/json",
    },
    httpMethod: "POST",
    body: Buffer.from(JSON.stringify(payload)).toString("base64"),
  };
}

async function getScheduleMap(jobs?: IJob[]): Promise<ScheduleMap> {
  const result: ScheduleMap = {};

  iterateSchedule(
    ({ time, name, userIds, kind }) => {
      result[time] = {
        name,
        userIds,
        kind,
      };
    },
    jobs ?? (await getJobs()),
  );

  return result;
}

function iterateSchedule(
  operator: (context: TimeContext & UsersContext & Job) => void,
  jobs: IJob[],
) {
  jobs.forEach((job) => {
    const timeContext = getTimeContext(job);
    const usersContext = getUsersContext(job);
    const { name } = job;

    if (timeContext && usersContext && name) {
      const { time } = timeContext;
      const { userIds, kind } = usersContext;

      operator({
        time,
        name,
        userIds,
        kind,
      });
    }
  });
}

async function getJobs() {
  const client = getClient();
  const [jobs] = await client.listJobs({
    parent: process.env.PARENT,
  });

  return jobs;
}

function getTimeContext(job: IJob): TimeContext | undefined {
  const { schedule } = job;
  if (!schedule) {
    return undefined;
  }

  return {
    time: schedule,
  };
}

function getUsersContext(job: IJob): (UsersContext & KindContext) | undefined {
  const { httpTarget } = job;

  if (!httpTarget) {
    return undefined;
  }

  const { body } = httpTarget;
  const { userIds, kind }: CollectReportEvent = JSON.parse(
    Buffer.from(body as string, "base64").toString(),
  );

  return {
    userIds,
    kind,
  };
}

function getMinutes({ hours, minutes }: Time): number {
  return hours * 60 + minutes;
}
