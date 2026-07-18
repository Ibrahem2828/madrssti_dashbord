import type {Capability} from "./capabilities";

/** Serializable icon keys keep Server Component navigation safe to pass to the client shell. */
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

export type NavigationMobileBehavior = "show" | "hide";

/** A declarative, serializable route item. Permission checks remain backend-authoritative. */
export type NavigationItem = {
  id: string;
  labelKey: string;
  descriptionKey?: string;
  href: string;
  icon: NavigationIconName;
  permission?: string;
  permissionsAny?: readonly string[];
  permissionsAll?: readonly string[];
  capability?: Capability;
  featureFlag?: string;
  implemented: boolean;
  exact?: boolean;
  routeMatchers?: readonly string[];
  order: number;
  mobileBehavior?: NavigationMobileBehavior;
  tooltipKey?: string;
};

export type NavigationGroup = {
  id: string;
  labelKey: string;
  icon?: NavigationIconName;
  order: number;
  collapsible?: boolean;
  items: readonly NavigationItem[];
};
