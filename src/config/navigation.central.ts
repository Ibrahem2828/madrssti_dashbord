import {CENTRAL_PERMISSIONS} from "./permissions";
import type {NavigationItem} from "./navigation.types";

export const centralNavigation: readonly NavigationItem[] = [
  {key: "dashboard", href: "/central", icon: "dashboard", permission: CENTRAL_PERMISSIONS.dashboardView, enabled: true},
  {key: "schools", href: "/central/schools", icon: "schools", permission: CENTRAL_PERMISSIONS.schoolsRead, enabled: true},
  {
    key: "schoolAdministrators",
    href: "/central/school-administrators",
    icon: "roles",
    anyOf: [CENTRAL_PERMISSIONS.schoolAdminRead, CENTRAL_PERMISSIONS.schoolAdminCreate],
    capability: "central.schoolAdmin",
    enabled: true,
  },
  {key: "health", href: "/central/health", icon: "health", permission: CENTRAL_PERMISSIONS.schoolsHealthView, enabled: true},
  {key: "tickets", href: "/central/tickets", icon: "tickets", permission: CENTRAL_PERMISSIONS.ticketsRead, enabled: true},
  {key: "audit", href: "/central/audit", icon: "audit", permission: CENTRAL_PERMISSIONS.auditRead, enabled: true},
  {key: "policies", href: "/central/policies", icon: "policies", permission: CENTRAL_PERMISSIONS.policiesRead, enabled: true},
];
