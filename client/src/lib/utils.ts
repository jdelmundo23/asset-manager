import { IPRow } from "@shared/schemas";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIP(row: IPRow) {
  const { subnetPrefix, hostNumber } = row;
  return subnetPrefix != null && hostNumber != null
    ? `${subnetPrefix}.${hostNumber}`
    : "";
}
