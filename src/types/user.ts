import { User as EventUser } from "./event";

export type User = EventUser & {
  timezone: number;
};
