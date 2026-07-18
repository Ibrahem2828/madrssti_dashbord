import {CENTRAL_PERMISSIONS} from "./permissions";
import type {NavigationGroup} from "./navigation.types";

/** Central routes remain isolated from school navigation and school context. */
export const centralNavigation: readonly NavigationGroup[] = [
  {
    id: "main",
    labelKey: "navigation.groups.main",
    order: 10,
    items: [
      {id: "dashboard", labelKey: "navigation.dashboard", descriptionKey: "navigation.descriptions.dashboard", href: "/central", icon: "dashboard", permission: CENTRAL_PERMISSIONS.dashboardView, capability: "central.dashboard", implemented: true, exact: true, order: 10},
    ],
  },
  {
    id: "administration",
    labelKey: "navigation.groups.administration",
    order: 20,
    items: [
      {id: "schools", labelKey: "navigation.schools", descriptionKey: "navigation.descriptions.schools", href: "/central/schools", icon: "schools", permission: CENTRAL_PERMISSIONS.schoolsRead, capability: "central.schools", implemented: true, order: 10},
      {id: "schoolAdministrators", labelKey: "navigation.schoolAdministrators", descriptionKey: "navigation.descriptions.schoolAdministrators", href: "/central/school-administrators", icon: "roles", permissionsAny: [CENTRAL_PERMISSIONS.schoolAdminRead, CENTRAL_PERMISSIONS.schoolAdminCreate], capability: "central.schoolAdmin", implemented: true, order: 20},
    ],
  },
  {
    id: "followup",
    labelKey: "navigation.groups.followup",
    order: 30,
    items: [
      {id: "tickets", labelKey: "navigation.tickets", descriptionKey: "navigation.descriptions.tickets", href: "/central/tickets", icon: "tickets", permission: CENTRAL_PERMISSIONS.ticketsRead, capability: "central.tickets", implemented: true, order: 10},
      {id: "audit", labelKey: "navigation.audit", descriptionKey: "navigation.descriptions.audit", href: "/central/audit", icon: "audit", permission: CENTRAL_PERMISSIONS.auditRead, capability: "central.audit", implemented: true, order: 20},
    ],
  },
  {
    id: "system",
    labelKey: "navigation.groups.system",
    order: 40,
    items: [
      {id: "health", labelKey: "navigation.health", descriptionKey: "navigation.descriptions.health", href: "/central/health", icon: "health", permission: CENTRAL_PERMISSIONS.schoolsHealthView, capability: "central.health", implemented: true, order: 10},
      {id: "policies", labelKey: "navigation.policies", descriptionKey: "navigation.descriptions.policies", href: "/central/policies", icon: "policies", permission: CENTRAL_PERMISSIONS.policiesRead, capability: "central.policies", implemented: true, order: 20},
    ],
  },
];
