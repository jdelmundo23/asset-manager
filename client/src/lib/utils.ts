import { IPRow } from "@shared/schemas";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function getServerUrl(): string {
  return import.meta.env.VITE_BACKEND_URL;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIP(row: IPRow) {
  const { subnetPrefix, hostNumber } = row;
  return subnetPrefix != null && hostNumber != null
    ? `${subnetPrefix}.${hostNumber}`
    : "";
}

export function formatFileSize(bytes: number): string {
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  } else {
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }
}
