import {
  CardClickedEvent,
  DateInput,
  FormAction,
  TimeInput,
} from "../types/event";
import { ReportFilter } from "../types/flow";
import { CardsResponse, Section, Widget } from "../types/respose";
import { Schedule, Time } from "../types/schedule";
import { getTimestamp, getToDate } from "../utils/time";
import { getAudience, getUserWidget, mapUsers } from "./users";

export async function getStatusPrompt(): Promise<CardsResponse> {
  return await getPrompt({
    cardId: "status",
    title: "Get Status",
    buttonText: "Get Status",
    action: "getStatus",
  });
}

export async function getUnschedulePrompt(): Promise<CardsResponse> {
  return await getPrompt({
    cardId: "unschedule",
    title: "Unschedule",
    buttonText: "Deactivate",
    action: "deactivateSchedule",
  });
}

export async function getReportPrompt(): Promise<CardsResponse> {
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

  return await getPrompt({
    cardId: "report",
    title: "Report",
    buttonText: "Get Report",
    action: "getReport",
    checked: true,
    section,
  });
}

export async function getSchedulePrompt(): Promise<CardsResponse> {
  const schedule = new Date().getTime();
  const section: Section = {
    header: "Pick out active period",
    widgets: [
      {
        dateTimePicker: {
          name: "start",
          label: "Start",
          type: "TIME_ONLY",
          valueMsEpoch: String(schedule),
        },
      },
      {
        dateTimePicker: {
          name: "finish",
          label: "Finish",
          type: "TIME_ONLY",
          valueMsEpoch: String(schedule),
        },
      },
    ],
  };

  return await getPrompt({
    cardId: "schedule",
    title: "Schedule",
    buttonText: "Activate",
    action: "activateSchedule",
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

async function getPrompt({
  cardId,
  title,
  buttonText,
  action,
  header = "Fellows",
  checked = false,
  section,
}: {
  cardId: string;
  title: string;
  buttonText: string;
  action: FormAction["actionMethodName"];
  header?: string;
  checked?: boolean;
  section?: Section;
}): Promise<CardsResponse> {
  const widgets = await getUserWidgets(checked);

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
              header,
              widgets,
            },
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
    result.cardsV2[0].card.sections?.splice(1, 0, section);
  }

  return result;
}

async function getUserWidgets(selected = false): Promise<Widget[]> {
  return await mapUsers((user, schedule) => {
    const result = getUserWidget(user, schedule);
    result.decoratedText.switchControl = {
      name: "fellows",
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
    timeInput: { hours, minutes },
  } = formInputs[inputName] as TimeInput;

  return {
    hours,
    minutes,
  };
}
