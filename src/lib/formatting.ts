export function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
};

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
