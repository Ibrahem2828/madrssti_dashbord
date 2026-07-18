import {SCHOOL_PERMISSIONS} from "./permissions";
import type {NavigationGroup} from "./navigation.types";

/**
 * School navigation is declarative and only lists routes that exist in the App Router.
 * Visibility is resolved in PortalShell from effective permissions and backend capabilities.
 */
export const schoolNavigation: readonly NavigationGroup[] = [
  {
    id: "main",
    labelKey: "navigation.groups.main",
    order: 10,
    items: [
      {id: "dashboard", labelKey: "navigation.dashboard", descriptionKey: "navigation.descriptions.dashboard", href: "/school", icon: "dashboard", permission: SCHOOL_PERMISSIONS.dashboardView, capability: "school.dashboard", implemented: true, exact: true, order: 10},
    ],
  },
  {
    id: "administration",
    labelKey: "navigation.groups.administration",
    order: 20,
    items: [
      {id: "users", labelKey: "navigation.users", descriptionKey: "navigation.descriptions.users", href: "/school/users", icon: "users", permission: SCHOOL_PERMISSIONS.usersRead, capability: "school.users", implemented: true, routeMatchers: ["/school/users/:id", "/school/users/:id/edit"], order: 10},
      {id: "newUser", labelKey: "navigation.newUser", descriptionKey: "navigation.descriptions.newUser", href: "/school/users/new", icon: "users", permission: SCHOOL_PERMISSIONS.usersCreate, capability: "school.users", implemented: true, exact: true, order: 20},
      {id: "rolesAndPermissions", labelKey: "navigation.rolesAndPermissions", descriptionKey: "navigation.descriptions.rolesAndPermissions", href: "/school/roles", icon: "roles", permissionsAny: [SCHOOL_PERMISSIONS.rolesRead, SCHOOL_PERMISSIONS.permissionsRead], capability: "school.users", implemented: true, routeMatchers: ["/school/permissions"], order: 30},
    ],
  },
  {
    id: "academics",
    labelKey: "navigation.groups.academics",
    order: 30,
    items: [
      {id: "academic", labelKey: "navigation.academic", descriptionKey: "navigation.descriptions.academic", href: "/school/academic", icon: "academics", permission: SCHOOL_PERMISSIONS.academicYearsManage, capability: "school.academics", implemented: true, order: 10},
      {id: "attendance", labelKey: "navigation.attendance", descriptionKey: "navigation.descriptions.attendance", href: "/school/attendance", icon: "attendance", permission: SCHOOL_PERMISSIONS.attendanceRead, capability: "school.attendance", implemented: true, order: 20},
    ],
  },
  {
    id: "correspondence",
    labelKey: "navigation.groups.correspondence",
    icon: "documents",
    order: 40,
    collapsible: true,
    items: [
      {id: "correspondenceOverview", labelKey: "navigation.correspondenceOverview", descriptionKey: "navigation.descriptions.correspondenceOverview", href: "/school/correspondence", icon: "documents", permission: SCHOOL_PERMISSIONS.documentsRead, capability: "school.documents", implemented: true, exact: true, order: 10},
      {id: "newDocument", labelKey: "navigation.newDocument", descriptionKey: "navigation.descriptions.newDocument", href: "/school/correspondence/new", icon: "documents", permissionsAny: [SCHOOL_PERMISSIONS.documentsCreate, SCHOOL_PERMISSIONS.outgoingCreate, SCHOOL_PERMISSIONS.incomingCreate, SCHOOL_PERMISSIONS.circularsCreate], capability: "school.documents", implemented: true, exact: true, order: 20},
      {id: "outgoing", labelKey: "navigation.outgoing", descriptionKey: "navigation.descriptions.outgoing", href: "/school/correspondence/outgoing", icon: "outgoing", permission: SCHOOL_PERMISSIONS.outgoingRead, capability: "school.documents", implemented: true, order: 30},
      {id: "incoming", labelKey: "navigation.incoming", descriptionKey: "navigation.descriptions.incoming", href: "/school/correspondence/incoming", icon: "incoming", permission: SCHOOL_PERMISSIONS.incomingRead, capability: "school.documents", implemented: true, order: 40},
      {id: "internal", labelKey: "navigation.internal", descriptionKey: "navigation.descriptions.internal", href: "/school/correspondence/internal", icon: "documents", permission: SCHOOL_PERMISSIONS.documentsRead, capability: "school.documents", implemented: true, order: 50},
      {id: "circulars", labelKey: "navigation.circulars", descriptionKey: "navigation.descriptions.circulars", href: "/school/correspondence/circulars", icon: "reply", permission: SCHOOL_PERMISSIONS.circularsRead, capability: "school.documents", implemented: true, order: 60},
      {id: "needsReply", labelKey: "navigation.needsReply", descriptionKey: "navigation.descriptions.needsReply", href: "/school/correspondence/needs-reply", icon: "reply", permission: SCHOOL_PERMISSIONS.documentsRead, capability: "school.documents", implemented: true, order: 70},
      {id: "archive", labelKey: "navigation.archive", descriptionKey: "navigation.descriptions.archive", href: "/school/correspondence/archive", icon: "archive", permission: SCHOOL_PERMISSIONS.documentsRead, capability: "school.archive", implemented: true, order: 80},
      {id: "categories", labelKey: "navigation.categories", descriptionKey: "navigation.descriptions.categories", href: "/school/correspondence/categories", icon: "collections", permission: SCHOOL_PERMISSIONS.documentsManageCategories, capability: "school.documentCategories", implemented: true, order: 90},
      {id: "parties", labelKey: "navigation.parties", descriptionKey: "navigation.descriptions.parties", href: "/school/correspondence/parties", icon: "collections", permission: SCHOOL_PERMISSIONS.documentsManageParties, capability: "school.correspondenceParties", implemented: true, order: 100},
    ],
  },
  {
    id: "followup",
    labelKey: "navigation.groups.followup",
    order: 50,
    items: [
      {id: "reports", labelKey: "navigation.reports", descriptionKey: "navigation.descriptions.reports", href: "/school/reports", icon: "reports", permissionsAny: [SCHOOL_PERMISSIONS.reportsView, SCHOOL_PERMISSIONS.attendanceReportsView, SCHOOL_PERMISSIONS.pointsLeaderboardView, SCHOOL_PERMISSIONS.atRiskView, SCHOOL_PERMISSIONS.coreReportsView], capability: "school.reports", implemented: true, order: 10},
      {id: "notifications", labelKey: "navigation.notifications", descriptionKey: "navigation.descriptions.notifications", href: "/school/notifications", icon: "notifications", permission: SCHOOL_PERMISSIONS.notificationsRead, capability: "school.notifications", implemented: true, order: 20},
      {id: "tickets", labelKey: "navigation.tickets", descriptionKey: "navigation.descriptions.tickets", href: "/school/tickets", icon: "tickets", permission: SCHOOL_PERMISSIONS.ticketsView, capability: "school.tickets", implemented: true, order: 30},
    ],
  },
  {
    id: "system",
    labelKey: "navigation.groups.system",
    order: 60,
    items: [
      {id: "settings", labelKey: "navigation.settings", descriptionKey: "navigation.descriptions.settings", href: "/school/settings", icon: "settings", permission: SCHOOL_PERMISSIONS.settingsUpdate, capability: "school.settings", implemented: true, order: 10},
    ],
  },
];
