import { authenticatedApiClient } from "@/services/apiInterceptor";
import type { ApiResponse } from "@/types/api";

export interface ApiDocumentOverview {
  total: number;
  outgoing: number;
  incoming: number;
  internal: number;
  needs_reply: number;
  overdue_replies: number;
  archived: number;
  by_status: Record<string, number>;
  recent_activity: {
    document_id: string;
    action: string;
    title: string;
    created_at: string;
  }[];
}

export interface ApiDocumentCategory {
  id: string;
  name: string;
  code: string;
  parent: string | null;
  description?: string;
  is_active: boolean;
}

export interface ApiCorrespondenceParty {
  id: string;
  name: string;
  party_type: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active: boolean;
}

export interface ApiDocumentListItem {
  id: string;
  direction: string;
  document_type: string;
  status: string;
  priority: string;
  title: string;
  document_number: string;
  sequence_number: number | null;
  document_date: string;
  registered_at: string;
  category: ApiDocumentCategory | null;
  needs_reply: boolean;
  attachments_count: number;
  source_party?: ApiCorrespondenceParty | null;
  target_party?: ApiCorrespondenceParty | null;
  source_name?: string;
  target_name?: string;
}

export interface ApiDocumentDetail extends ApiDocumentListItem {
  subject: string;
  notes?: string;
  reply_due_date?: string | null;
  replied_at?: string | null;
  related_document?: string | null;
  relation_type?: string | null;
  academic_year?: string | null;
  tags: string[];
  created_by?: { id: string; full_name: string } | null;
  updated_by?: { id: string; full_name: string } | null;
  created_at: string;
  updated_at: string;
  attachments: ApiDocumentAttachment[];
  related_documents: unknown[];
}

export interface ApiDocumentAttachment {
  id: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  is_primary: boolean;
  download_url: string;
  preview_url?: string;
  uploaded_by?: { id: string; full_name: string } | null;
  created_at: string;
}

export interface ApiPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiCreateDocumentPayload {
  direction: string;
  document_type: string;
  status?: string;
  priority: string;
  title: string;
  subject: string;
  document_date: string;
  category?: string;
  source_party?: string;
  target_party?: string;
  source_name?: string;
  target_name?: string;
  needs_reply?: boolean;
  reply_due_date?: string;
  tags?: string[];
  notes?: string;
}

export interface ApiCreateDocumentResponse {
  id: string;
  document_number: string;
  sequence_number: number;
  status: string;
}

export function apiFetchDocumentsOverview(params?: {
  from?: string;
  to?: string;
  document_type?: string;
  category?: string;
  party?: string;
}): Promise<ApiResponse<ApiDocumentOverview>> {
  return authenticatedApiClient.get<ApiDocumentOverview>("admin/documents/overview", { params: params as Record<string, string | number | boolean | undefined> });
}

export function apiFetchDocuments(params?: {
  direction?: string;
  document_type?: string;
  status?: string;
  priority?: string;
  category?: string;
  source_party?: string;
  target_party?: string;
  document_date_from?: string;
  document_date_to?: string;
  registered_from?: string;
  registered_to?: string;
  needs_reply?: boolean;
  reply_due_before?: string;
  tag?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}): Promise<ApiResponse<ApiPaginatedResponse<ApiDocumentListItem>>> {
  return authenticatedApiClient.get<ApiPaginatedResponse<ApiDocumentListItem>>("admin/documents", { params: params as Record<string, string | number | boolean | undefined> });
}

export function apiFetchDocumentById(id: string): Promise<ApiResponse<ApiDocumentDetail>> {
  return authenticatedApiClient.get<ApiDocumentDetail>(`admin/documents/${id}`);
}

export function apiCreateDocument(payload: ApiCreateDocumentPayload): Promise<ApiResponse<ApiCreateDocumentResponse>> {
  return authenticatedApiClient.post<ApiCreateDocumentResponse>("admin/documents", payload, { idempotent: true });
}

export function apiUpdateDocument(id: string, payload: Partial<ApiCreateDocumentPayload>): Promise<ApiResponse<{ id: string; priority?: string; updated_at: string }>> {
  return authenticatedApiClient.patch<{ id: string; priority?: string; updated_at: string }>(`admin/documents/${id}`, payload, { idempotent: true });
}

export function apiDeleteDocument(id: string, reason: string): Promise<ApiResponse<null>> {
  return authenticatedApiClient.delete<null>(`admin/documents/${id}`, {
    headers: { "Content-Type": "application/json" },
    idempotent: true,
  });
}

export function apiUploadAttachment(documentId: string, file: File, isPrimary: boolean): Promise<ApiResponse<ApiDocumentAttachment>> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("is_primary", String(isPrimary));
  return authenticatedApiClient.post<ApiDocumentAttachment>(`admin/documents/${documentId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    idempotent: false,
  });
}

export function apiFetchAttachments(documentId: string): Promise<ApiResponse<ApiDocumentAttachment[]>> {
  return authenticatedApiClient.get<ApiDocumentAttachment[]>(`admin/documents/${documentId}/attachments`);
}

export function apiLinkDocument(documentId: string, relatedDocumentId: string, relationType: string): Promise<ApiResponse<{ id: string; related_document: string; relation_type: string }>> {
  return authenticatedApiClient.post<{ id: string; related_document: string; relation_type: string }>(
    `admin/documents/${documentId}/link`,
    { related_document: relatedDocumentId, relation_type: relationType },
    { idempotent: true }
  );
}

export function apiCreateReply(documentId: string, payload: { title: string; subject: string; document_date: string; priority: string; notes?: string }): Promise<ApiResponse<{ id: string; document_number: string; related_document: string; relation_type: string }>> {
  return authenticatedApiClient.post<{ id: string; document_number: string; related_document: string; relation_type: string }>(
    `admin/documents/${documentId}/create-reply`,
    payload,
    { idempotent: true }
  );
}

export function apiMarkSent(documentId: string, sentAt: string, reason: string): Promise<ApiResponse<{ id: string; status: string }>> {
  return authenticatedApiClient.post<{ id: string; status: string }>(
    `admin/documents/${documentId}/mark-sent`,
    { sent_at: sentAt, reason },
    { idempotent: true }
  );
}

export function apiMarkReceived(documentId: string, receivedAt: string, reason: string): Promise<ApiResponse<{ id: string; status: string }>> {
  return authenticatedApiClient.post<{ id: string; status: string }>(
    `admin/documents/${documentId}/mark-received`,
    { received_at: receivedAt, reason },
    { idempotent: true }
  );
}

export function apiArchiveDocument(documentId: string, reason: string): Promise<ApiResponse<{ id: string; status: string }>> {
  return authenticatedApiClient.post<{ id: string; status: string }>(
    `admin/documents/${documentId}/archive`,
    { reason },
    { idempotent: true }
  );
}

export function apiFetchDocumentActivity(documentId: string, params?: { page?: number; page_size?: number }): Promise<ApiResponse<ApiPaginatedResponse<{ id: string; action: string; message: string; actor: { id: string; full_name: string } | null; created_at: string }>>> {
  return authenticatedApiClient.get<ApiPaginatedResponse<{ id: string; action: string; message: string; actor: { id: string; full_name: string } | null; created_at: string }>>(
    `admin/documents/${documentId}/activity`,
    { params: params as Record<string, string | number | boolean | undefined> }
  );
}

export function apiFetchDocumentCategories(params?: {
  parent?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}): Promise<ApiResponse<ApiPaginatedResponse<ApiDocumentCategory>>> {
  return authenticatedApiClient.get<ApiPaginatedResponse<ApiDocumentCategory>>("admin/document-categories", { params: params as Record<string, string | number | boolean | undefined> });
}

export function apiCreateDocumentCategory(payload: { name: string; code: string; parent?: string | null; description?: string; is_active?: boolean }): Promise<ApiResponse<{ id: string; name: string; code: string }>> {
  return authenticatedApiClient.post<{ id: string; name: string; code: string }>("admin/document-categories", payload, { idempotent: true });
}

export function apiFetchCorrespondenceParties(params?: {
  party_type?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}): Promise<ApiResponse<ApiPaginatedResponse<ApiCorrespondenceParty>>> {
  return authenticatedApiClient.get<ApiPaginatedResponse<ApiCorrespondenceParty>>("admin/correspondence-parties", { params: params as Record<string, string | number | boolean | undefined> });
}

export function apiCreateCorrespondenceParty(payload: { name: string; party_type: string; phone?: string; email?: string; address?: string; notes?: string; is_active?: boolean }): Promise<ApiResponse<{ id: string; name: string; party_type: string }>> {
  return authenticatedApiClient.post<{ id: string; name: string; party_type: string }>("admin/correspondence-parties", payload, { idempotent: true });
}