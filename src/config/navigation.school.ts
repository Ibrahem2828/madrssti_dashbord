import {SCHOOL_PERMISSIONS} from "./permissions";
import type {NavigationItem} from "./navigation.types";

export const schoolNavigation: readonly NavigationItem[] = [
  {key: "dashboard", href: "/school", icon: "dashboard", permission: SCHOOL_PERMISSIONS.dashboardView, enabled: true},
  {key: "users", href: "/school/users", icon: "users", permission: SCHOOL_PERMISSIONS.usersRead, enabled: true},
  {key: "academic", href: "/school/academic", icon: "academics", permission: SCHOOL_PERMISSIONS.academicYearsManage, enabled: true},
  {key: "attendance", href: "/school/attendance", icon: "attendance", permission: SCHOOL_PERMISSIONS.attendanceRead, enabled: true},
  {key: "correspondence", href: "/school/correspondence", icon: "documents", permission: SCHOOL_PERMISSIONS.documentsRead, enabled: true},
  {key: "archive", href: "/school/archive", icon: "archive", permission: SCHOOL_PERMISSIONS.documentsRead, enabled: true},
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
