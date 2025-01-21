import { db } from "./db";

type User = {
  first: string;
  last: string;
  born: number;   
};

export async function test() {
    const docRef = db.collection('users').doc('alovelace');

    await docRef.set({
      first: 'Ada',
      last: 'Lovelace',
      born: 1815
    });
}

export async function test2() {
  const result: User[] = [];
  const users = await db.collection('users').get();
  users.forEach(user => {
    result.push(user.data() as User);
  });

  return result;
}
