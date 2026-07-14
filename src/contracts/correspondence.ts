import type { UUID, ISO8601DateTime, ISO8601Date } from "@/types/api";

export type DocumentDirection = "INCOMING" | "OUTGOING" | "INTERNAL";
export type DocumentType =
  | "OFFICIAL_LETTER"
  | "MEMORANDUM"
  | "CIRCULAR"
  | "REPORT"
  | "MINUTES"
  | "DECISION"
  | "RECOMMENDATION"
  | "NOTICE";

export type DocumentStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED"
  | "CANCELLED";

export type DocumentPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface DocumentAttachment {
  readonly id: UUID;
  readonly documentId: UUID;
  readonly fileName: string;
  readonly originalName: string;
  readonly mimeType: string;
  readonly fileSize: number;
  readonly fileUrl: string;
  readonly uploadedBy: UUID;
  readonly uploadedByName: string;
  readonly sequenceNumber: number;
  readonly createdAt: ISO8601DateTime;
}

export interface DocumentAction {
  readonly id: UUID;
  readonly documentId: UUID;
  readonly action: "REVIEWED" | "APPROVED" | "REJECTED" | "FORWARDED" | "SIGNED";
  readonly actorId: UUID;
  readonly actorName: string;
  readonly comment: string | null;
  readonly createdAt: ISO8601DateTime;
}

export interface CorrespondenceDocument {
  readonly id: UUID;
  readonly schoolId: UUID;
  readonly schoolName: string;
  readonly direction: DocumentDirection;
  readonly type: DocumentType;
  readonly status: DocumentStatus;
  readonly priority: DocumentPriority;
  readonly title: string;
  readonly referenceNumber: string;
  readonly subject: string;
  readonly summary: string | null;
  readonly senderName: string | null;
  readonly senderDepartment: string | null;
  readonly recipientName: string | null;
  readonly recipientDepartment: string | null;
  readonly sentDate: ISO8601Date | null;
  readonly receivedDate: ISO8601Date | null;
  readonly dueDate: ISO8601Date | null;
  readonly isConfidential: boolean;
  readonly tags: readonly string[];
  readonly createdBy: UUID;
  readonly createdByName: string;
  readonly attachments: readonly DocumentAttachment[];
  readonly actions: readonly DocumentAction[];
  readonly createdAt: ISO8601DateTime;
  readonly updatedAt: ISO8601DateTime;
}

export interface CreateDocumentPayload {
  schoolId: UUID;
  direction: DocumentDirection;
  type: DocumentType;
  priority: DocumentPriority;
  title: string;
  subject: string;
  summary?: string;
  senderId?: string;
  senderDepartment?: string;
  recipientName?: string;
  recipientDepartment?: string;
  sentDate?: ISO8601Date;
  receivedDate?: ISO8601Date;
  dueDate?: ISO8601Date;
  isConfidential?: boolean;
  tags?: string[];
}

export interface DocumentFilterParams {
  readonly direction?: DocumentDirection;
  readonly status?: DocumentStatus;
  readonly priority?: DocumentPriority;
  readonly type?: DocumentType;
  readonly search?: string;
  readonly dateFrom?: ISO8601Date;
  readonly dateTo?: ISO8601Date;
  readonly schoolId?: UUID;
}