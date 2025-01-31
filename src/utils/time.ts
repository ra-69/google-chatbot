export function getTimestamp(time: number) {
  return Math.floor(time / 1000);
}

export function toDate(timestamp: number) {
  return new Date(Math.floor(timestamp * 1000));
}

export function getToDate() {
  const result = new Date();
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

export function getTime(schedule: string | undefined): string {
  if (!schedule) {
    return "Unscheduled";
  }

  const [minutes, hours] = schedule.split(" ");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}
