import { Firestore, QuerySnapshot } from '@google-cloud/firestore';

export const db = new Firestore();

type User = {
  email: string;
};

type Report = {
  user: string;
  text: string;
  date: Date;
};

type IdContext = {
  id?: string;
}

type CollectionName = "users" | "reports";
type CollectionEntity<Collection extends CollectionName> = Collection extends "users" ? User : Report;
type CollectionEntityWithId<Collection extends CollectionName> = CollectionEntity<Collection> & IdContext;
type Filter<Collection extends CollectionName, Field extends keyof CollectionEntity<Collection> = keyof CollectionEntity<Collection>> = {
  field: Field;
  operator: "<" | "<=" | "==" | ">=" | ">";
  value: CollectionEntity<Collection>[Field]; 
}

export async function getQuerySnapshot<Collection extends CollectionName>(collection: Collection) {
  const docs = await db.collection(collection).get() as QuerySnapshot<CollectionEntity<Collection>>;
  return docs;
}

export async function filterQuerySnapshot<Collection extends CollectionName>(collection: Collection, {field, operator, value}: Filter<Collection>) {
  const docs = await db.collection(collection).where(field as string, operator, value).get() as QuerySnapshot<CollectionEntity<Collection>>;
  return docs;
}

export async function readCollection<Collection extends CollectionName>(collection: Collection) {
  const result: CollectionEntityWithId<Collection>[] = [];
  const docs = await getQuerySnapshot(collection);
  docs.forEach(doc => {
    const data = doc.data()
    result.push({
      ...data,
      id: doc.id
    });
  });

  return result;
}


export async function createDocument<Collection extends CollectionName>(collection: Collection, document: Collection extends "users" ? User : Report) {
  const docRef = db.collection(collection).doc();
  await docRef.set(document);
}


export async function readDocument(collection: "users" | "reports", id: string) {
  const docRef = db.collection(collection).doc(id);
  const doc = await docRef.get();
  return doc.data() as typeof collection extends "users" ? User : Report; 
}
