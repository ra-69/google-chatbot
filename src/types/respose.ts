
/** https://developers.google.com/workspace/chat/api/reference/rest/v1/spaces.messages#resource:-message */
export type ChatResponse = { actionResponse: ActionResponse } | TextResponse;

export type TextResponse = {
  text: string; 
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/spaces.messages#actionresponse */
export type ActionResponse = {
  type: "DIALOG";
  dialogAction: DialogAction;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/spaces.messages#dialogaction */
export type DialogAction = {
  dialog: Dialog;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/spaces.messages#dialog */
export type Dialog = {
  body: Card;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#Message.Card_1 */ 
export type Card = {
  header: CardHeader;
  fixedFooter?: CardFixedFooter;
  sections: Section[];
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#Message.CardHeader */
export type CardHeader = {
  title: string;
  subtitle: string;
  imageUrl: string;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#Message.CardFixedFooter */
export type CardFixedFooter = {
  primaryButton: CardButton;
  secondaryButton: CardButton;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#Message.CardButton */
export type CardButton = {
  text: string;
  color?: Color;
  onClick?: {
    action: {
      actionMethodName: string;
    }
  }
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#Color */
export type Color = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#section */
export type Section = {
  header: string;
  widgets: Widget[];
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#widget */
export type Widget = { textInput: TextInput };

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#textinput */
export type TextInput = {
  name: string;
    label?: string;
    value?: string;
    hintText?: string;
    placeholderText?: string;
    type: "SINGLE_LINE" | "MULTIPLE_LINE";
}

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#Message.CardAction */
export type CardAction = {
  actionLabel: string;
  onClick: {
    action: {
      actionMethodName: string;
    }
  }
};