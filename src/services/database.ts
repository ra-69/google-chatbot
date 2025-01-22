import { DocumentReference, Firestore, QuerySnapshot } from "@google-cloud/firestore";
import { User } from "../types/event";
import { FlowState, StatusReport } from "../types/flow";

export const db = new Firestore();

type Entity<T extends Collection> = T extends "users" ? User : T extends "flows" ? FlowState : Report;

type Collection = "users" | "flows" | "reports";

type Report = StatusReport & {
  userId: string;
};

type Filter<T extends Collection, Field extends keyof Entity<T> = keyof Entity<T>> = {
  field: Field;
  operator: "<" | "<=" | "==" | ">=" | ">";
  value: Entity<T>[Field]; 
};

type EntityWithId<T extends Collection> = Entity<T> & Id;
type Id = {
  id?: string;
};

export async function getQuerySnapshot<T extends Collection>(collection: T) {
  const res = await db.collection(collection).get() as QuerySnapshot<Entity<T>>;
  return res;
}

export async function filterQuerySnapshot<T extends Collection>(collection: T, filter: Filter<T>) {
  const { field, operator, value } = filter;
  const res = await db.collection(collection).where(field as string, operator, value).get() as QuerySnapshot<Entity<T>>;

  return res;
}

export async function addEntity<T extends Collection>(collection: T, entity: Entity<T>) {
  const res = await db.collection(collection).add(entity) as DocumentReference<Entity<T>>;
  return res;
}

export async function setEntity<T extends Collection>(collection: T, id: string, entity: Entity<T>) {
  const res = await db.collection(collection).doc(id).set(entity);
  return res;
}

export async function getEntity<T extends Collection>(collection: T, id: string) {
  const res = await db.collection(collection).doc(id).get();
  return res.data() as Entity<T> | undefined;
};

export async function readSnapshot<T extends Collection>(spanshot: QuerySnapshot<Entity<T>>) {
  const result: EntityWithId<T>[] = [];
  spanshot.forEach(doc => {
    const data = doc.data()
    result.push({
      ...data,
      id: doc.id
    });
  });

  return result;
}
