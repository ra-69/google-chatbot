import { CollectionReference, Firestore } from "@google-cloud/firestore";
import { FlowState, StatusReport } from "../types/flow";
import { User } from "../types/user";
import { ScheduleRecord, UserScheduleRecord } from "../types/schedule";

export const db = new Firestore();

type Entity<T extends Collection> = T extends "users"
  ? User
  : T extends "flows"
    ? FlowState
    : T extends "reports"
      ? Report
      : T extends "schedules"
        ? ScheduleRecord
        : UserScheduleRecord;

type Collection = "users" | "flows" | "reports" | "schedules" | "userSchedule";

type Report = StatusReport & {
  userId: string;
};

export function getRef<T extends Collection>(collection: T) {
  return db.collection(collection) as CollectionReference<Entity<T>>;
}
