export type NavigationIconName =
  | "dashboard"
  | "schools"
  | "health"
  | "tickets"
  | "audit"
  | "policies"
  | "users"
  | "roles"
  | "academics"
  | "attendance"
  | "documents"
  | "archive"
  | "incoming"
  | "outgoing"
  | "reply"
  | "collections"
  | "reports"
  | "notifications"
  | "settings";

export type NavigationItem = {
  key: string;
  href: string;
  icon: NavigationIconName;
  permission?: string;
  anyOf?: readonly string[];
  capability?: string;
  enabled: boolean;
  children?: readonly NavigationItem[];
};
