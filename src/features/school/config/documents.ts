import {SCHOOL_PERMISSIONS} from "@/config/permissions";

export type SchoolDocumentListMode =
  | "all"
  | "outgoing"
  | "incoming"
  | "internal"
  | "circulars"
  | "needs-reply"
  | "archive";

export const schoolDocumentModeConfig = {
  all: {
    titleKey: "overviewRouteTitle",
    descriptionKey: "overviewRouteDescription",
    pathKey: "list",
    requiredPermission: SCHOOL_PERMISSIONS.documentsRead,
    defaultFilters: {},
  },
  outgoing: {
    titleKey: "outgoingTitle",
    descriptionKey: "outgoingDescription",
    pathKey: "outgoing",
    requiredPermission: SCHOOL_PERMISSIONS.outgoingRead,
    defaultFilters: {direction: "OUTGOING"},
  },
  incoming: {
    titleKey: "incomingTitle",
    descriptionKey: "incomingDescription",
    pathKey: "incoming",
    requiredPermission: SCHOOL_PERMISSIONS.incomingRead,
    defaultFilters: {direction: "INCOMING"},
  },
  internal: {
    titleKey: "internalTitle",
    descriptionKey: "internalDescription",
    pathKey: "list",
    requiredPermission: SCHOOL_PERMISSIONS.documentsRead,
    defaultFilters: {direction: "INTERNAL"},
  },
  circulars: {
    titleKey: "circularsTitle",
    descriptionKey: "circularsDescription",
    pathKey: "circulars",
    requiredPermission: SCHOOL_PERMISSIONS.circularsRead,
    defaultFilters: {document_type: "CIRCULAR"},
  },
  "needs-reply": {
    titleKey: "needsReplyTitle",
    descriptionKey: "needsReplyDescription",
    pathKey: "needsReply",
    requiredPermission: SCHOOL_PERMISSIONS.documentsRead,
    defaultFilters: {needs_reply: "true"},
  },
  archive: {
    titleKey: "archiveTitle",
    descriptionKey: "archiveDescription",
    pathKey: "list",
    requiredPermission: SCHOOL_PERMISSIONS.documentsRead,
    defaultFilters: {status: "ARCHIVED"},
  },
} as const;

export function getCreatePermissionForDirection(direction: string) {
  switch (direction) {
    case "OUTGOING":
      return SCHOOL_PERMISSIONS.outgoingCreate;
    case "INCOMING":
      return SCHOOL_PERMISSIONS.incomingCreate;
    default:
      return SCHOOL_PERMISSIONS.documentsCreate;
  }
}

export function getUpdatePermissionForDirection(direction: string) {
  switch (direction) {
    case "OUTGOING":
      return SCHOOL_PERMISSIONS.outgoingUpdate;
    case "INCOMING":
      return SCHOOL_PERMISSIONS.incomingUpdate;
    default:
      return SCHOOL_PERMISSIONS.documentsUpdate;
  }
}
