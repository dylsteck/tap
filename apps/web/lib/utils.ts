import { WEB_BASE_URL } from "@tap/common";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const isDev = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;
const localUrl = `http://localhost:${port}`;

export const BASE_URL = isDev ? localUrl : WEB_BASE_URL;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}