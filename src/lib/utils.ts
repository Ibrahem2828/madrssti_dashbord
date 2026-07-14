import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...values: ClassValue[]): string {
  return twMerge(clsx(values));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2);
  }

  return parts
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidSaudiPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return /^(?:\+966|00966|0)?5[0-9]{8}$/.test(cleaned);
}

export function getTodayDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getHijriYear(): string {
  const gregorianYear = new Date().getFullYear();
  const hijriYear = Math.floor((gregorianYear - 622) * (33 / 32));
  return String(hijriYear + 1);
}

export function truncateMiddle(value: string, maxLength = 28): string {
  if (value.length <= maxLength) {
    return value;
  }

  const partLength = Math.max(4, Math.floor((maxLength - 1) / 2));
  return `${value.slice(0, partLength)}…${value.slice(-partLength)}`;
}
