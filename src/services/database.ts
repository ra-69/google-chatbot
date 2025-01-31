import { CollectionReference, Firestore } from "@google-cloud/firestore";
import { User } from "../types/event";
import { FlowState, StatusReport } from "../types/flow";

export const db = new Firestore();

type Entity<T extends Collection> = T extends "users"
  ? User
  : T extends "flows"
    ? FlowState
    : Report;

type Collection = "users" | "flows" | "reports";

type Report = StatusReport & {
  userId: string;
};

export function getRef<T extends Collection>(collection: T) {
  return db.collection(collection) as CollectionReference<Entity<T>>;
}
