import { CardClickedEvent, DateInput, StringInputs } from "../types/event";
import { ReportFilter } from "../types/flow";
import { CardsResponse, SelectionItem } from "../types/respose";
import { getTimestamp } from "../utils/time";
import { getRef } from "./database";

export async function getReportPrompt(): Promise<CardsResponse> {
  const users = await getRef("users").get();

  const items: SelectionItem[] = users.docs.map(doc => {
    const { displayName, email } = doc.data();
    return {
      text: displayName,
      value: email,
      selected: true
    };
  });

  const to = getToDate().getTime();
  const from = to - 1000 * 60 * 60 * 24;

  const result: CardsResponse = {
    cardsV2: [{
      cardId: "",
      card: {
        header: {
          title: "Report"
        },
        sections: [{
          header: "Fellows",
          widgets: [
            {
              selectionInput: {
                type: "CHECK_BOX",
                name: "fellows",
                items
              }
            }
          ]
        }, {
          header: "Pick out date",
          widgets: [
            {
              dateTimePicker: {
                name: "from",
                label: "From Date",
                type: "DATE_ONLY",
                valueMsEpoch: String(from),
              }
            },
            {
              dateTimePicker: {
                name: "to",
                label: "To Date",
                type: "DATE_ONLY",
                valueMsEpoch: String(to)
              }
            }
          ]
        }, {
          widgets: [
            {
              buttonList: {
                buttons: [
                  {
                    text: "Show Report",
                    onClick: {
                      action: {
                        function: "getReport"
                      }
                    }
                  }
                ]
              }
            }
          ]
        }]
      }
    }]
  };

  return result;
}

export function getReportFilter(event: CardClickedEvent): ReportFilter {
  const { common: { formInputs: {
    fellows,
    from,
    to
  }}} = event;

  const { 
    stringInputs: { 
      value: userIds 
    } 
  } = fellows as StringInputs;

  const { 
    dateInput: { 
      msSinceEpoch: fromDate 
    } 
  } = from as DateInput;

  const { 
    dateInput: { 
      msSinceEpoch: toDate 
    } 
  } = to as DateInput;

  return {
    userIds,
    from: getTimestamp(parseInt(fromDate)),
    to: getTimestamp(parseInt(toDate))
  };
}

function getToDate() {
  const result = new Date();
  result.setUTCHours(0, 0, 0, 0);
  return result;
}