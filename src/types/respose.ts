import { FormAction } from "./event";

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/spaces.messages#resource:-message */
export type ChatResponse =
  | { actionResponse: ActionResponse }
  | TextResponse
  | CardsResponse;

export type TextResponse = {
  text: string;
};

export type CardsResponse = {
  cardsV2: CardV2[];
};

export type CardV2 = {
  cardId: string;
  card: Card;
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
  header?: CardHeader;
  fixedFooter?: CardFixedFooter;
  sections?: Section[];
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#Message.CardHeader */
export type CardHeader = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imageType?: "CIRCLE" | "SQUARE";
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
    };
  };
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
  header?: string;
  widgets: Widget[];
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#widget */
export type Widget =
  | { textInput: TextInput }
  | { decoratedText: DecoratedText }
  | { dateTimePicker: DateTimePicker }
  | { selectionInput: SelectionInput }
  | { buttonList: ButtonList };

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#textinput */
export type TextInput = {
  name: string;
  label?: string;
  value?: string;
  hintText?: string;
  placeholderText?: string;
  type: "SINGLE_LINE" | "MULTIPLE_LINE";
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#decoratedtext */
export type DecoratedText = {
  icon?: Icon;
  startIcon?: Icon;
  topLabel?: string;
  text: string;
  bottomLabel?: string;
  switchControl?: SwitchControl;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#icon */
export type Icon = {
  altText?: string;
  imageType?: "SQUARE" | "CIRCLE";
  knownIcon?: string;
  iconUrl?: string;
  materialIcon?: MaterialIcon;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#materialicon */
export type MaterialIcon = {
  name: string;
  fill: boolean;
  weight: number;
  grade: number;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#Message.SwitchControl */
export type SwitchControl = {
  name: string;
  value?: string;
  selected: boolean;
  controlType: ControlType;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#controltype */
export type ControlType = "CHECK_BOX" | "RADIO_BUTTON" | "SWITCH";

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#Message.CardAction */
export type CardAction = {
  actionLabel: string;
  onClick: {
    action: {
      actionMethodName: string;
    };
  };
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#datetimepicker */
export type DateTimePicker = {
  name: string;
  label: string;
  type: "DATE_AND_TIME" | "DATE_ONLY" | "TIME_ONLY";
  valueMsEpoch?: string;
  timezoneOffsetMs?: string;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#selectioninput */
export type SelectionInput = {
  name: string;
  label?: string;
  type: ControlType;
  items: SelectionItem[];
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#selectionitem */
export type SelectionItem = {
  text: string;
  value: string;
  selected: boolean;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#buttonlist */
export type ButtonList = {
  buttons: [Button];
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#button */
export type Button = {
  text: string;
  onClick: OnClick;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#onclick */
export type OnClick = {
  action: Action;
};

/** https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#action */
export type Action = {
  function: FormAction["actionMethodName"];
};
