export class DailyLimitExceededError extends Error {
  constructor() {
    super("Daily session limit reached");
    this.name = "DailyLimitExceededError";
  }
}
