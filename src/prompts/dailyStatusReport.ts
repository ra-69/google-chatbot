import { ChatResponse } from "../types/respose";

export const dailyStatusReport: ChatResponse = {
  actionResponse: {
    type: "DIALOG",
    dialogAction: {
      dialog: {
        body: {
          header: {
            title: "Daily Status Report",
            subtitle: "Please provide your daily status report",
            imageUrl: "https://cdn-icons-png.freepik.com/512/4712/4712035.png?ga=GA1.1.525717437.1718802422"
          },
          // fixedFooter: {
          //   primaryButton: {
          //     text: "Submit",
          //     onClick: {
          //       action: {
          //         actionMethodName: "submitReport"
          //       }
          //     }
          //   },
          //   secondaryButton: {
          //     text: "Cancel",
          //     onClick: {
          //       action: {
          //         actionMethodName: "cancelReport"
          //       }
          //     }
          //   }
          // },
          sections: [
            {
              header: "Daily Status Report",
              widgets: [
                {
                  textInput: {
                    type: "MULTIPLE_LINE",
                    name: "done",
                    label: "Done",
                    placeholderText: "What did you accomplish yesterday?"
                  }
                },
                {
                  textInput: {
                    type: "MULTIPLE_LINE",
                    name: "inProgress",
                    label: "In Progress",
                    placeholderText: "What are you working on today?"
                  }
                },
                {
                  textInput: {
                    type: "MULTIPLE_LINE",
                    name: "blockers",
                    label: "Blockers",
                    placeholderText: "Do you have any blockers?"
                  }
                },
                {
                  textInput: {
                    type: "MULTIPLE_LINE",
                    name: "comments",
                    label: "Comments",
                    placeholderText: "Any other comments?"
                  }
                }
              ]
            }
          ]
        }
      }
    }
  }
}
