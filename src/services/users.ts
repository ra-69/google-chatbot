import { CardsResponse, DecoratedText } from "../types/respose";
import { getRef } from "./database";

export async function listTeam(): Promise<CardsResponse> {
  const users = await getRef("users").get();

  const widgets = users.docs.map((doc): { decoratedText: DecoratedText } => {
    const { displayName, email, avatarUrl } = doc.data();

    return {
      decoratedText: {
        startIcon: {
          iconUrl: avatarUrl,
          imageType: "CIRCLE"
        },
        text: displayName,
        bottomLabel: email
      }
    };
  });

  return {
    cardsV2: [{
      cardId: "team",
      card: {
        header: {
          title: "The Team"
        },
        sections: [
          {
            widgets
          }
        ]
      }
    }]
  };
}
