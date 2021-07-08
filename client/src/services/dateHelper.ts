import BN from "bn.js";
import CapsuleType from "../types/CapsuleType";

export const inputToDate = (input: string): Date => {
  const lDt = input.split(" ");
  const value_d = lDt[0];
  const items = value_d.split("/");
  const time = lDt.length > 1 ? lDt[1].split(":") : ["00", "00", "00"];
  const newDate = new Date(
    `${items[0]}/${items[1]}/${items[2]} ${time[0]}:${time[1]}:${time[2]}`
  );
  return newDate;
};

export const dateToUnix = (date: Date): BN => {
  return new BN(date.getTime() / 1000);
};

export const getCurrentUnix = (): number => {
  return new Date().getTime() / 1000;
};

export const UnixToDate = (unix: number): Date => {
  return new Date(unix * 1000);
};

export const DAYS = 60 * 60 * 24;
export const WEEKS = 60 * 60 * 24 * 7;
export const MONTHS = Math.round(60 * 60 * 24 * (365 / 12));
export const YEARS = Math.round(60 * 60 * 24 * 365);

export const getPeriodType = (periodSize: string): string => {
  const size = Number(periodSize);
  if (size === DAYS) return "daily";
  if (size === WEEKS) return "weekly";
  if (size === MONTHS) return "monthly";
  if (size === YEARS) return "annually";
  return "unknown";
};

export const getPeriodSize = (periodType: string): number => {
  if (periodType === "daily") return DAYS;
  if (periodType === "weekly") return WEEKS;
  if (periodType === "monthly") return MONTHS;
  if (periodType === "annually") return YEARS;
  return 1;
};

export const getNextOpenDate = (capsule: CapsuleType): Date => {
  return new Date(
    capsule.distributionDate.getTime() +
      capsule.claimedPeriods * getPeriodSize(capsule.periodType) * 1000
  );
};

export const getCanBeOpened = (capsule: CapsuleType): boolean => {
  return (
    capsule.distributionDate.getTime() +
      capsule.claimedPeriods * getPeriodSize(capsule.periodType) * 1000 <
    new Date().getTime()
  );
};
