import {SCHOOL_PERMISSIONS} from "@/config/permissions";

export type PermissionGroup = {
  key: string;
  titleKey: string;
  descriptionKey: string;
  permissions: readonly string[];
};

export const schoolPermissionGroups: readonly PermissionGroup[] = [
  {
    key: "users",
    titleKey: "users",
    descriptionKey: "usersDescription",
    permissions: [
      SCHOOL_PERMISSIONS.usersRead,
      SCHOOL_PERMISSIONS.usersCreate,
      SCHOOL_PERMISSIONS.usersUpdate,
      SCHOOL_PERMISSIONS.usersDisableEnable,
      SCHOOL_PERMISSIONS.usersResetPassword,
    ],
  },
  {
    key: "rbac",
    titleKey: "rbac",
    descriptionKey: "rbacDescription",
    permissions: [
      SCHOOL_PERMISSIONS.rolesRead,
      SCHOOL_PERMISSIONS.permissionsRead,
      SCHOOL_PERMISSIONS.effectivePermissionsView,
      SCHOOL_PERMISSIONS.assignRole,
      SCHOOL_PERMISSIONS.grantPermission,
      SCHOOL_PERMISSIONS.revokePermission,
    ],
  },
  {
    key: "reports",
    titleKey: "reports",
    descriptionKey: "reportsDescription",
    permissions: [
      SCHOOL_PERMISSIONS.coreReportsView,
      SCHOOL_PERMISSIONS.reportsView,
      SCHOOL_PERMISSIONS.attendanceReportsView,
      SCHOOL_PERMISSIONS.pointsLeaderboardView,
      SCHOOL_PERMISSIONS.atRiskView,
    ],
  },
  {
    key: "tickets",
    titleKey: "tickets",
    descriptionKey: "ticketsDescription",
    permissions: [
      SCHOOL_PERMISSIONS.ticketsView,
      SCHOOL_PERMISSIONS.ticketsAssign,
      SCHOOL_PERMISSIONS.ticketsClose,
      SCHOOL_PERMISSIONS.ticketsEscalate,
    ],
  },
  {
    key: "documents",
    titleKey: "documents",
    descriptionKey: "documentsDescription",
    permissions: [
      SCHOOL_PERMISSIONS.documentsRead,
      SCHOOL_PERMISSIONS.documentsCreate,
      SCHOOL_PERMISSIONS.documentsUpdate,
      SCHOOL_PERMISSIONS.documentsDelete,
      SCHOOL_PERMISSIONS.documentsArchive,
      SCHOOL_PERMISSIONS.documentsPreview,
      SCHOOL_PERMISSIONS.documentsDownload,
      SCHOOL_PERMISSIONS.documentsLink,
    ],
  },
  {
    key: "outgoing",
    titleKey: "outgoing",
    descriptionKey: "outgoingDescription",
    permissions: [
      SCHOOL_PERMISSIONS.outgoingRead,
      SCHOOL_PERMISSIONS.outgoingCreate,
      SCHOOL_PERMISSIONS.outgoingUpdate,
      SCHOOL_PERMISSIONS.outgoingMarkSent,
    ],
  },
  {
    key: "incoming",
    titleKey: "incoming",
    descriptionKey: "incomingDescription",
    permissions: [
      SCHOOL_PERMISSIONS.incomingRead,
      SCHOOL_PERMISSIONS.incomingCreate,
      SCHOOL_PERMISSIONS.incomingUpdate,
      SCHOOL_PERMISSIONS.incomingMarkReceived,
    ],
  },
  {
    key: "circulars",
    titleKey: "circulars",
    descriptionKey: "circularsDescription",
    permissions: [
      SCHOOL_PERMISSIONS.circularsRead,
      SCHOOL_PERMISSIONS.circularsCreate,
      SCHOOL_PERMISSIONS.circularsReply,
    ],
  },
  {
    key: "financial",
    titleKey: "financial",
    descriptionKey: "financialDescription",
    permissions: [SCHOOL_PERMISSIONS.financialDocumentsRead, SCHOOL_PERMISSIONS.financialDocumentsManage],
  },
  {
    key: "administrative",
    titleKey: "administrative",
    descriptionKey: "administrativeDescription",
    permissions: [SCHOOL_PERMISSIONS.adminDocumentsRead, SCHOOL_PERMISSIONS.adminDocumentsManage],
  },
  {
    key: "guidance",
    titleKey: "guidance",
    descriptionKey: "guidanceDescription",
    permissions: [SCHOOL_PERMISSIONS.guidanceDocumentsRead, SCHOOL_PERMISSIONS.guidanceDocumentsManage],
  },
  {
    key: "collections",
    titleKey: "collections",
    descriptionKey: "collectionsDescription",
    permissions: [SCHOOL_PERMISSIONS.documentsManageCategories, SCHOOL_PERMISSIONS.documentsManageParties],
  },
] as const;

const permissionToGroup = new Map<string, string>(
  schoolPermissionGroups.flatMap((group) => group.permissions.map((permission) => [permission, group.key] as const)),
);

export function getPermissionGroupKey(permission: string) {
  return permissionToGroup.get(permission) ?? "other";
}
