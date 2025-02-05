type MessageContent = {
  text: string;
};

export type Message = {
  userId: string;
} & MessageContent;

export type MessageGroup = {
  userIds: string[];
} & MessageContent;
