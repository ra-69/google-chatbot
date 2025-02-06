import { Time } from "../types/schedule";

export function getTimestamp(time: number) {
  return Math.floor(time / 1000);
}

export function toDate(timestamp: number) {
  return new Date(Math.floor(timestamp * 1000));
}

export function getToDate() {
  const result = new Date();
  result.setUTCHours(24, 0, 0, 0);
  return result;
}

export function getTime(time: Required<Time>, timezone: number): string {
  const [minutes, hours] = toLocal(time, timezone);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function toUtc(time: Time, timezone: number): Time {
  const [minutes, hours] = toLocal(
    {
      hours: time.hours ?? 0,
      minutes: time.minutes ?? 0,
    },
    -timezone,
  );

  return {
    minutes,
    hours,
  };
}

function toLocal(
  { hours, minutes }: Required<Time>,
  timezone: number,
): [number, number] {
  const result = new Date();
  result.setHours(hours + timezone, minutes);
  return [result.getMinutes(), result.getHours()];
}
