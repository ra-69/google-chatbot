import { timezones } from "../config/timezone";
import {
  CardClickedEvent,
  DateInput,
  FormAction,
  StringInputs,
  TimeInput,
} from "../types/event";
import { ReportFilter } from "../types/flow";
import { CardsResponse, Section, Widget } from "../types/respose";
import { Schedule, Time } from "../types/schedule";
import { getTimestamp, getToDate } from "../utils/time";
import { getRef } from "./database";
import { getUserWidget, mapUsers } from "./users";

type BasePrompt = {
  cardId: string;
  title: string;
  buttonText: string;
  action: FormAction["actionMethodName"];
  section?: Section;
};

type UsersPrompt = BasePrompt & {
  timezone: number;
  header?: string;
  checked?: boolean;
};

export async function getStatusPrompt(
  timezone: number,
): Promise<CardsResponse> {
  return await getUsersPrompt({
    cardId: "status",
    title: "Get Status",
    buttonText: "Get Status",
    action: "getStatus",
    timezone,
  });
}

export async function getUnschedulePrompt(
  timezone: number,
): Promise<CardsResponse> {
  return await getUsersPrompt({
    cardId: "unschedule",
    title: "Unschedule",
    buttonText: "Deactivate",
    action: "deactivateSchedule",
    timezone,
  });
}

export async function getReportPrompt(
  timezone: number,
): Promise<CardsResponse> {
  const to = getToDate().getTime();
  const from = to - 1000 * 60 * 60 * 24;

  const section: Section = {
    header: "Pick out date",
    widgets: [
      {
        dateTimePicker: {
          name: "from",
          label: "From Date",
          type: "DATE_ONLY",
          valueMsEpoch: String(from),
        },
      },
      {
        dateTimePicker: {
          name: "to",
          label: "To Date",
          type: "DATE_ONLY",
          valueMsEpoch: String(to),
        },
      },
    ],
  };

  return await getUsersPrompt({
    cardId: "report",
    title: "Report",
    buttonText: "Get Report",
    action: "getReport",
    checked: true,
    section,
    timezone,
  });
}

export async function getSchedulePrompt(
  timezone: number,
): Promise<CardsResponse> {
  const now = new Date();
  now.setHours(now.getHours() + timezone);
  now.setMinutes(now.getMinutes() + 5);
  const start = now.getTime();
  now.setMinutes(now.getMinutes() + 35);
  const to = now.getTime();
  const section: Section = {
    header: "Pick out active period",
    widgets: [
      {
        dateTimePicker: {
          name: "start",
          label: "Start",
          type: "TIME_ONLY",
          valueMsEpoch: String(start),
        },
      },
      {
        dateTimePicker: {
          name: "finish",
          label: "Finish",
          type: "TIME_ONLY",
          valueMsEpoch: String(to),
        },
      },
    ],
  };

  return await getUsersPrompt({
    cardId: "schedule",
    title: "Schedule",
    buttonText: "Activate",
    action: "activateSchedule",
    section,
    timezone,
  });
}

export async function getTimezonePrompt(
  userId: string,
): Promise<CardsResponse> {
  const user = (await getRef("users").doc(userId).get()).data();
  const currentTimezone = (user?.timezone || 0).toString();

  const items = timezones.map((timezone) => ({
    ...timezone,
    selected: timezone.value === currentTimezone,
  }));

  const section: Section = {
    header: "Pick out time zone",
    widgets: [
      {
        selectionInput: {
          name: "timeZones",
          label: "Time Zones",
          items,
          type: "RADIO_BUTTON",
        },
      },
    ],
  };

  return getBasePrompt({
    cardId: "timezone",
    title: "Timezone",
    buttonText: "Set Timezone",
    action: "setTimezone",
    section,
  });
}

export function getReportFilter(event: CardClickedEvent): ReportFilter {
  return {
    userIds: getAudience(event),
    from: getInputTimestamp(event, "from"),
    to: getInputTimestamp(event, "to"),
  };
}

export function getSchedule(event: CardClickedEvent): Schedule {
  const userIds = getAudience(event);
  const start = getInputTime(event, "start");
  const finish = getInputTime(event, "finish");

  return {
    userIds,
    start,
    finish,
  };
}

export function getTimezone(
  event: CardClickedEvent,
  inputName = "timeZones",
): number {
  const value = getStringInputs(event, inputName);
  return parseInt(value[0]);
}

export function getAudience(event: CardClickedEvent): string[] {
  return getSwithControlInputs(event, (user) => user.indexOf("@") !== -1);
}

function getBasePrompt({
  cardId,
  title,
  buttonText,
  action,
  section,
}: BasePrompt): CardsResponse {
  const result: CardsResponse = {
    cardsV2: [
      {
        cardId,
        card: {
          header: {
            title,
          },
          sections: [
            {
              widgets: [
                {
                  buttonList: {
                    buttons: [
                      {
                        text: buttonText,
                        onClick: {
                          action: {
                            function: action,
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  };

  if (section) {
    result.cardsV2[0].card.sections?.unshift(section);
  }

  return result;
}

async function getUsersPrompt({
  cardId,
  title,
  buttonText,
  action,
  header = "Fellows",
  checked = false,
  timezone,
  section,
}: UsersPrompt): Promise<CardsResponse> {
  const widgets = await getUserWidgets(timezone, checked);

  const result = getBasePrompt({
    cardId,
    title,
    buttonText,
    action,
    section,
  });

  result.cardsV2[0].card.sections?.unshift({
    header,
    widgets,
  });

  return result;
}

async function getUserWidgets(
  timezone: number,
  selected = false,
): Promise<Widget[]> {
  return await mapUsers((user, schedule) => {
    const result = getUserWidget(user, schedule, timezone);
    result.decoratedText.switchControl = {
      name: user.email,
      value: user.email,
      selected,
      controlType: "CHECK_BOX",
    };

    return result;
  });
}

function getInputTimestamp(event: CardClickedEvent, inputName: string): number {
  const {
    common: { formInputs },
  } = event;

  const {
    dateInput: { msSinceEpoch },
  } = formInputs[inputName] as DateInput;

  return getTimestamp(parseInt(msSinceEpoch));
}

function getInputTime(event: CardClickedEvent, inputName: string): Time {
  const {
    common: { formInputs },
  } = event;

  const {
    timeInput: { hours = 0, minutes = 0 },
  } = formInputs[inputName] as TimeInput;

  return {
    hours,
    minutes,
  };
}

function getStringInputs(event: CardClickedEvent, inputName: string): string[] {
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

function getSwithControlInputs(
  event: CardClickedEvent,
  isValid: (key: string) => boolean,
): string[] {
  const {
    common: { formInputs },
  } = event;

  if (!formInputs) {
    return [];
  }

  return Object.keys(formInputs).filter((key) => isValid(key));
}
