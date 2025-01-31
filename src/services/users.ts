import { CardClickedEvent, StringInputs, User } from "../types/event";
import { CardsResponse, DecoratedText, Widget } from "../types/respose";
import { UsersMap } from "../types/schedule";
import { getTime } from "../utils/time";
import { getRef } from "./database";
import { getUsersMap as getUsersJobMap } from "./scheduler";

export async function listTeam(): Promise<CardsResponse> {
  const widgets = await mapUsers(getUserWidget);

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
  const result: { [userId: string]: User } = {};

  users.docs.forEach((doc) => {
    result[doc.id] = doc.data();
  });

  return result;
}

export async function mapUsers(
  operator: (user: User, schedules: UsersMap) => Widget,
): Promise<Widget[]> {
  const [users, schedules] = await Promise.all([
    getRef("users").get(),
    getUsersJobMap("start"),
  ]);

  const widgets = users.docs.map((doc): Widget => {
    const user = doc.data();
    return operator(user, schedules);
  });

  return widgets;
}

export function getUserWidget(
  user: User,
  schedules: UsersMap,
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
      bottomLabel: getTime(schedule?.time),
    },
  };
}

export function isAdmin(email: string): boolean {
  const admins = process.env.ADMIN?.split(";") ?? [];
  return admins.includes(email);
}

export function getAudience(
  event: CardClickedEvent,
  inputName = "fellows",
): string[] {
  const {
    common: { formInputs },
  } = event;

  if (!formInputs || !formInputs[inputName]) {
    return [];
  }

  const {
    stringInputs: { value },
  } = formInputs[inputName] as StringInputs;

  return value;
}
