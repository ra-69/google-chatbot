export function getTimestamp(time: number) {
  return Math.floor(time / 1000);
}

export function toDate(timestamp: number) {
  return new Date(Math.floor(timestamp * 1000));
}