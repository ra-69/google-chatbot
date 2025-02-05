import { User } from "../types/event";
import { User as UserRecord } from "../types/user";
import { CardsResponse, DecoratedText, Widget } from "../types/respose";
import { UsersMap } from "../types/schedule";
import { getTime } from "../utils/time";
import { getRef } from "./database";
import { getUsersMap as getUsersJobMap } from "./scheduler";

export async function listTeam(timezone: number): Promise<CardsResponse> {
  const widgets = await mapUsers(getUserWidget, timezone);

  return {
    cardsV2: [
      {
        cardId: "team",
        card: {
          header: {
            title: "The Team",
          },
          sections: [
            {
              widgets,
            },
          ],
        },
      },
    ],
  };
}

export async function getUsersMap() {
  const users = await getRef("users").get();
  const result: { [userId: string]: UserRecord } = {};

  users.docs.forEach((doc) => {
    result[doc.id] = doc.data();
  });

  return result;
}

export async function mapUsers(
  operator: (user: User, schedules: UsersMap, timezone: number) => Widget,
  timezone = 0,
): Promise<Widget[]> {
  const [users, schedules] = await Promise.all([
    getRef("users").get(),
    getUsersJobMap("start"),
  ]);

  const widgets = users.docs.map((doc): Widget => {
    const user = doc.data();
    return operator(user, schedules, timezone);
  });

  return widgets;
}

export function getUserWidget(
  user: User,
  schedules: UsersMap,
  timezone = 0,
): { decoratedText: DecoratedText } {
  const { displayName, email, avatarUrl } = user;
  const schedule = schedules[email];

  return {
    decoratedText: {
      startIcon: {
        iconUrl: avatarUrl,
        imageType: "CIRCLE",
      },
      topLabel: email,
      text: displayName,
      bottomLabel: getTime(schedule?.time, timezone),
    },
  };
}

export function getAdmins(): string[] {
  return process.env.ADMIN?.split(";") ?? [];
}

export function isAdmin(email: string): boolean {
  const admins = getAdmins();
  return admins.includes(email);
}

export async function getUser(email: string): Promise<UserRecord | undefined> {
  return (await getRef("users").doc(email).get()).data();
}
