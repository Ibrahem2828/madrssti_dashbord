import {SCHOOL_PERMISSIONS} from "./permissions";
import type {NavigationItem} from "./navigation.types";

export const schoolNavigation: readonly NavigationItem[] = [
  {key: "dashboard", href: "/school", icon: "dashboard", permission: SCHOOL_PERMISSIONS.dashboardView, enabled: true},
  {key: "users", href: "/school/users", icon: "users", permission: SCHOOL_PERMISSIONS.usersRead, enabled: true},
  {key: "newUser", href: "/school/users/new", icon: "users", permission: SCHOOL_PERMISSIONS.usersCreate, enabled: true},
  {key: "rolesAndPermissions", href: "/school/users", icon: "roles", anyOf: [SCHOOL_PERMISSIONS.rolesRead, SCHOOL_PERMISSIONS.permissionsRead], enabled: true},
  {key: "academic", href: "/school/academic", icon: "academics", permission: SCHOOL_PERMISSIONS.academicYearsManage, enabled: true},
  {key: "attendance", href: "/school/attendance", icon: "attendance", permission: SCHOOL_PERMISSIONS.attendanceRead, enabled: true},
  {key: "correspondenceOverview", href: "/school/correspondence", icon: "documents", permission: SCHOOL_PERMISSIONS.documentsRead, enabled: true},
  {key: "newDocument", href: "/school/correspondence/new", icon: "documents", anyOf: [SCHOOL_PERMISSIONS.documentsCreate, SCHOOL_PERMISSIONS.outgoingCreate, SCHOOL_PERMISSIONS.incomingCreate, SCHOOL_PERMISSIONS.circularsCreate], enabled: true},
  {key: "outgoing", href: "/school/correspondence/outgoing", icon: "outgoing", permission: SCHOOL_PERMISSIONS.outgoingRead, enabled: true},
  {key: "incoming", href: "/school/correspondence/incoming", icon: "incoming", permission: SCHOOL_PERMISSIONS.incomingRead, enabled: true},
  {key: "internal", href: "/school/correspondence/internal", icon: "documents", permission: SCHOOL_PERMISSIONS.documentsRead, enabled: true},
  {key: "circulars", href: "/school/correspondence/circulars", icon: "reply", permission: SCHOOL_PERMISSIONS.circularsRead, enabled: true},
  {key: "needsReply", href: "/school/correspondence/needs-reply", icon: "reply", permission: SCHOOL_PERMISSIONS.documentsRead, enabled: true},
  {key: "archive", href: "/school/correspondence/archive", icon: "archive", permission: SCHOOL_PERMISSIONS.documentsRead, enabled: true},
  {key: "categories", href: "/school/correspondence/categories", icon: "collections", permission: SCHOOL_PERMISSIONS.documentsManageCategories, enabled: true},
  {key: "parties", href: "/school/correspondence/parties", icon: "collections", permission: SCHOOL_PERMISSIONS.documentsManageParties, enabled: true},
  {
    key: "reports",
    href: "/school/reports",
    icon: "reports",
    anyOf: [
      SCHOOL_PERMISSIONS.reportsView,
      SCHOOL_PERMISSIONS.attendanceReportsView,
      SCHOOL_PERMISSIONS.pointsLeaderboardView,
      SCHOOL_PERMISSIONS.atRiskView,
      SCHOOL_PERMISSIONS.coreReportsView,
    ],
    enabled: true,
  },
  {key: "notifications", href: "/school/notifications", icon: "notifications", permission: SCHOOL_PERMISSIONS.notificationsRead, enabled: true},
  {key: "tickets", href: "/school/tickets", icon: "tickets", permission: SCHOOL_PERMISSIONS.ticketsView, enabled: true},
  {key: "settings", href: "/school/settings", icon: "settings", permission: SCHOOL_PERMISSIONS.settingsUpdate, enabled: true},
];
