/** https://developers.google.com/workspace/chat/api/reference/rest/v1/Event */
export type ChatEvent = MessageEvent | RemovedFromSpaceEvent | AddedToSpaceEvent | CardClickedEvent;

export type EventContext = {
  eventTime: string;
  user: User;
  space: Space;
}

export type MessageEvent = {
  type: "MESSAGE";
  message: Message;
} & EventContext;

export type RemovedFromSpaceEvent = {
  type: "REMOVED_FROM_SPACE";
} & EventContext;

export type AddedToSpaceEvent = {
  type: "ADDED_TO_SPACE";
} & EventContext;

export type CardClickedEvent = {
  type: "CARD_CLICKED";
  common: CommonEventObject;
} & EventContext;


/** https://developers.google.com/workspace/chat/api/reference/rest/v1/User */
export type User = {
  type: "HUMAN";
  name: string;
  displayName: string;
  avatarUrl: string;
  email: string;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/spaces#resource:-space */
export type Space = DMSpace | RoomSpace;

export type SpaceContext = {
  name: string;
};

export type DMSpace = {
  type: "DM";
  singleUserBotDm: boolean;
} & SpaceContext;

export type RoomSpace = {
  type: "ROOM";
  displayName: string;
} & SpaceContext;

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/spaces.messages#Message */
export type Message = {
  name: string;
  text: string;
  createTime: string;
  argumentText: string;
  formattedText: string;
  sender: User;
  space: Space;
  slashCommand?: SlashCommand;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/spaces.messages#slashcommand */
export type SlashCommand = {
  commandId: "1" | "2" | "3";
}

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/Event#commoneventobject */
export type CommonEventObject = {
  formInputs: {
    [widgetName: string]: Inputs;
  }
}

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/Event#inputs */
export type Inputs = DateInput | StringInputs;

export type DateInput = {
  dateInput: {
    msSinceEpoch: string;
  }
}

export type StringInputs = {
  stringInputs: {
    value: string[];
  }
}
