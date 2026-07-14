import type {Portal} from "@/config/routes";

export function buildLoginCredentials(
  portal: Portal,
  identifier: string,
  password: string,
): {identifier: string; password: string} | {email: string; password: string};
