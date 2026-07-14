export type PaginatedResult<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type SchoolDashboardOverview = {
  students: number;
  attendanceToday: number;
  pointsTransactions: number;
  behaviorNotes: number;
  ticketsOpen: number;
};

export type SchoolDashboardKpis = Record<string, string | number>;

export type SchoolUser = {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  isActive: boolean;
  userType: string;
  roles: Array<{id: string; name: string}>;
};

export type SchoolRole = {
  id: string;
  name: string;
};

export type SchoolPermission = {
  code: string;
};

export type EffectivePermissionDetail = {
  code: string;
  source: string;
  roleName?: string | string[];
  overrideId?: string;
};

export type SchoolEffectivePermissions = {
  permissions: string[];
  permissionsDetail: EffectivePermissionDetail[];
};

export type SchoolAcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type SchoolGrade = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type SchoolClassroom = {
  id: string;
  name: string;
  gradeLevelId: string | null;
  isActive: boolean;
};

export type SchoolSubject = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
};

export type SchoolAttendanceRecord = {
  id: string;
  date: string;
  status: string;
  method: string;
  note: string;
  student: {
    id: string;
    studentCode: string;
    fullName: string;
  };
  classroom: {
    id: string;
    name: string;
  } | null;
};

export type SchoolExcuse = {
  id: string;
  student: {
    id: string;
    fullName: string;
  };
  date: string;
  reason: string;
  status: string;
  createdAt: string;
};

export type SchoolQrEntry = {
  id: string;
  ownerType: string;
  ownerId: string;
  ownerName: string;
  status: string;
  validFrom: string;
  validTo: string;
};

export type SchoolDocumentOverview = {
  total: number;
  outgoing: number;
  incoming: number;
  internal: number;
  needsReply: number;
  overdueReplies: number;
  archived: number;
  byStatus: Record<string, number>;
};

export type SchoolDocument = {
  id: string;
  direction: string;
  documentType: string;
  status: string;
  priority: string;
  title: string;
  subject: string;
  documentNumber: string;
  documentDate: string;
  registeredAt: string;
  categoryId: string | null;
  categoryName: string | null;
  sourcePartyId: string | null;
  sourcePartyName: string | null;
  targetPartyId: string | null;
  targetPartyName: string | null;
  sourceName: string;
  targetName: string;
  needsReply: boolean;
  replyDueDate: string | null;
  notes: string;
  tags: string[];
  attachmentsCount: number;
  attachments: SchoolDocumentAttachment[];
};

export type SchoolDocumentAttachment = {
  id: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  isPrimary: boolean;
  downloadUrl: string;
  previewUrl: string;
  createdAt: string;
  uploadedBy: {
    id: string;
    fullName: string;
    email: string;
  } | null;
};

export type SchoolDocumentActivity = {
  id: string;
  action: string;
  message: string;
  createdAt: string;
  actorName: string | null;
};

export type SchoolDocumentCategory = {
  id: string;
  name: string;
  code: string;
  parent: string | null;
  description: string;
  isActive: boolean;
};

export type SchoolCorrespondenceParty = {
  id: string;
  name: string;
  partyType: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  isActive: boolean;
};

export type SchoolTicket = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  createdAt: string;
};

export type SchoolSettings = {
  school: {
    id: string;
    name: string;
    code: string;
    phone: string;
    address: string;
    timezone: string;
  };
  settings: {
    aiEnabled: boolean;
    leaderboardEnabled: boolean;
    behaviorVisibility: string;
    pointsLimits: unknown;
    featureFlags: unknown;
  };
};

export type SchoolNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export type SchoolAttendanceReport = {
  summary: Record<string, number>;
};

export type SchoolPointsReportEntry = {
  studentId: string;
  points: number;
};

export type SchoolAtRiskStudent = {
  studentId: string;
  studentCode: string;
  fullName: string;
  absentDays: number;
  points: number;
};

export type SchoolBehaviorReport = Record<string, number>;

export type SchoolKpiReport = {
  students: number;
  staff: number;
  attendanceToday: number;
};
