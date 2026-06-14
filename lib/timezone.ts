const TZ = 'Asia/Riyadh';

/** Returns today's date as YYYY-MM-DD in Saudi Arabia (Mecca) time.
 *  Works on both server (Node) and browser. */
export function todaySA(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

/** Returns current month as YYYY-MM in Saudi Arabia time */
export function thisMonthSA(): string {
  return todaySA().slice(0, 7);
}

/** Returns current ISO timestamp (UTC) — for createdAt/loginAt fields */
export function nowISO(): string {
  return new Date().toISOString();
}
