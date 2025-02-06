import { CloudSchedulerClient, protos } from "@google-cloud/scheduler";
import { CollectReportEvent, RecylceSchedulesEvent } from "../types/event";
import {
  Job,
  Schedule,
  ScheduleContext,
  Time,
  UsersSchedule,
} from "../types/schedule";
import { TextResponse } from "../types/respose";
import { toUtc } from "../utils/time";
import { db, getRef } from "./database";

type IJob = protos.google.cloud.scheduler.v1.IJob;

let client: CloudSchedulerClient | undefined;

function getClient() {
  if (client) {
    return client;
  }

  client = new CloudSchedulerClient();
  return client;
}

export async function scheduleReport(
  schedule: Schedule,
  timezone = 0,
): Promise<TextResponse> {
  const { userIds } = schedule;
  const start = getMinutes(toUtc(schedule.start, timezone));
  const finish = getMinutes(toUtc(schedule.finish, timezone));

  if (start >= finish) {
    return {
      text: "Start time should be greater than finish time.",
    };
  }

  const scheduleId = getScheduleId(start, finish);
  const batch = db.batch();
  userIds.forEach((userId) => {
    batch.set(getRef("userSchedule").doc(userId), {
      userId,
      scheduleId,
    });
  });
  await batch.commit();

  const scheduleRec = await getRef("schedules").doc(scheduleId).get();
  if (!scheduleRec.exists) {
    await getRef("schedules").doc(scheduleId).set({
      start,
      finish,
      isActivated: false,
    });
  }

  if (process.env.MANAGE_JOBS === "true") {
    await createJob({
      name: "main",
      schedule: "* * * * 1-5",
    });

    await createJob({
      name: "recycle",
      schedule: "*/5 * * * 1-5",
    });
  }

  return {
    text: "Schedule is activated.",
  };
}

async function getJob(name: string) {
  const client = getClient();
  const [jobs] = await client.listJobs({
    parent: process.env.PARENT,
  });

  return jobs.find((job) => job.name === name);
}

async function createJob(def: Job) {
  const { name, schedule } = def;
  const payload: CollectReportEvent | RecylceSchedulesEvent =
    def.name === "main"
      ? {
          type: "COLLECT_REPORTS",
        }
      : {
          type: "RECYCLE_SCHEDULES",
        };

  const jobName = `${process.env.PARENT}/jobs/${name}`;
  const uri = process.env.HOST;
  const job: IJob = {
    name: jobName,
    schedule,
    httpTarget: {
      uri,
      headers: {
        "Content-Type": "application/json",
      },
      httpMethod: "POST",
      body: Buffer.from(JSON.stringify(payload)).toString("base64"),
    },
  };

  const client = getClient();
  const current = await getJob(jobName);

  if (!current) {
    await client.createJob({
      parent: process.env.PARENT,
      job,
    });
  }
}

export async function unscheduleReport(
  userIds: string[],
): Promise<TextResponse> {
  const batch = db.batch();
  userIds.forEach((userId) => {
    batch.delete(getRef("userSchedule").doc(userId));
  });

  await batch.commit();

  return {
    text: "Schedule is deactivated.",
  };
}

export async function recycleSchedules(): Promise<TextResponse> {
  const schedulesRef = getRef("schedules");
  const schedules = await schedulesRef.get();

  schedules.forEach(async (doc) => {
    const users = await getRef("userSchedule")
      .where("scheduleId", "==", doc.id)
      .get();
    if (users.empty) {
      await schedulesRef.doc(doc.id).delete();
    }
  });

  return {
    text: "Unused schedules were recycled.",
  };
}

export async function getUsersSchedule(): Promise<UsersSchedule> {
  const result: UsersSchedule = {};

  const schedule = await getRef("userSchedule").get();
  schedule.docs.map((doc) => {
    const { userId, scheduleId } = doc.data();
    result[userId] = getScheduleContext(scheduleId);
  });

  return result;
}

function getScheduleId(start: number, finish: number): string {
  return `${start}:${finish}`;
}

function getScheduleContext(scheduleId: string): ScheduleContext {
  const [start, finish] = scheduleId.split(":");
  return {
    start: getTime(parseInt(start)),
    finish: getTime(parseInt(finish)),
  };
}

function getTime(value: number): Required<Time> {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return {
    hours,
    minutes,
  };
}

function getMinutes({ hours = 0, minutes = 0 }: Time): number {
  return hours * 60 + minutes;
}
