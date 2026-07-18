"use client";

import type {FormEvent} from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {usePathname, useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";

import {Can} from "@/components/auth/can";
import {ErrorState, ForbiddenState, UnsupportedState} from "@/components/feedback/states";
import {Button} from "@/components/ui/button";
import {ConfirmDialog} from "@/components/ui/confirm-dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {gatewayHref} from "@/lib/api/browser-client";
import {Link} from "@/i18n/routing";
import {hasCapability} from "@/config/capabilities";
import {SCHOOL_PERMISSIONS} from "@/config/permissions";
import {schoolEndpoints} from "@/config/endpoints.school";
import {useUnsavedChangesGuard} from "@/hooks/use-unsaved-changes-guard";
import {DocumentFileUploader, type DocumentFileUploaderHandle} from "@/components/correspondence/document-file-uploader";
import {DocumentPreviewDialog} from "@/components/correspondence/document-preview-dialog";
import {
  DOCUMENT_DIRECTIONS,
  DOCUMENT_PRIORITIES,
  DOCUMENT_RELATION_TYPES,
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  PARTY_TYPES,
  activityActionTranslationKeys,
  directionTranslationKeys,
  documentTypeTranslationKeys,
  partyTypeTranslationKeys,
  priorityTranslationKeys,
  relationTypeTranslationKeys,
  statusTranslationKeys,
  translateEnum,
} from "@/lib/presentation/domain-enums";
import {usePortalSession} from "@/providers/auth-provider";

import {
  archiveDocument,
  createCategory,
  createDocument,
  createParty,
  createReplyDocument,
  deleteCategory,
  deleteDocument,
  deleteParty,
  fetchCategories,
  fetchDocument,
  fetchDocumentActivity,
  fetchDocumentOverview,
  fetchDocuments,
  fetchParties,
  linkDocument,
  markDocumentReceived,
  markDocumentSent,
  updateCategory,
  updateDocument,
  updateParty,
  uploadDocumentAttachment,
} from "../services/school-api";
import type {
  PaginatedResult,
  SchoolCorrespondenceParty,
  SchoolDocument,
  SchoolDocumentActivity,
  SchoolDocumentCategory,
  SchoolDocumentOverview,
} from "../types/contracts";
import {
  BodyCell,
  Card,
  DetailItem,
  HeaderCell,
  InlineError,
  InlineSuccess,
  LoadingBlock,
  PageHeader,
  Pagination,
  readFilters,
} from "./common";

export function SchoolDocumentsScreen() {
  const t = useTranslations("documents");
  const common = useTranslations("common");
  const directionT = useTranslations("direction");
  const documentTypeT = useTranslations("documentType");
  const priorityT = useTranslations("priority");
  const statusT = useTranslations("status");
  const access = usePortalSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(() => readFilters(searchParams, ["search", "status", "direction", "document_type", "needs_reply", "page"]));
  const [overview, setOverview] = useState<SchoolDocumentOverview | null>(null);
  const [documents, setDocuments] = useState<PaginatedResult<SchoolDocument> | null>(null);
  const [categories, setCategories] = useState<SchoolDocumentCategory[]>([]);
  const [parties, setParties] = useState<SchoolCorrespondenceParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [createdDocumentId, setCreatedDocumentId] = useState<string | null>(null);
  const uploaderRef = useRef<DocumentFileUploaderHandle | null>(null);
  const [form, setForm] = useState({
    direction: "OUTGOING",
    documentType: "LETTER",
    priority: "NORMAL",
    title: "",
    subject: "",
    documentDate: "",
    category: "",
    sourceParty: "",
    targetParty: "",
    sourceName: "",
    targetName: "",
    needsReply: false,
    replyDueDate: "",
    notes: "",
  });
  const hasUnsavedChanges = Boolean(
    form.title ||
      form.subject ||
      form.documentDate ||
      form.category ||
      form.sourceParty ||
      form.targetParty ||
      form.sourceName ||
      form.targetName ||
      form.needsReply ||
      form.replyDueDate ||
      form.notes ||
      form.direction !== "OUTGOING" ||
      form.documentType !== "LETTER" ||
      form.priority !== "NORMAL",
  );

  const directionLabel = (value: string) => translateEnum(value, directionT, directionTranslationKeys);
  const priorityLabel = (value: string) => translateEnum(value, priorityT, priorityTranslationKeys);
  const statusLabel = (value: string) => translateEnum(value, statusT, statusTranslationKeys);

  useUnsavedChangesGuard(hasUnsavedChanges, common("unsavedChanges"));

  const updateFilters = (next: Record<string, string>) => {
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [overviewResult, documentResult, categoryResult, partyResult] = await Promise.all([
      fetchDocumentOverview(),
      fetchDocuments({
        search: filters.search || undefined,
        status: filters.status || undefined,
        direction: filters.direction || undefined,
        page: filters.page || "1",
      }),
      fetchCategories({page: "1"}),
      fetchParties({page: "1"}),
    ]);
    if (!documentResult.success) {
      setError(documentResult.error.message);
      setLoading(false);
      return;
    }
    setOverview(overviewResult.success ? overviewResult.data : null);
    setDocuments(documentResult.data);
    setCategories(categoryResult.success ? categoryResult.data.results : []);
    setParties(partyResult.success ? partyResult.data.results : []);
    setLoading(false);
  }, [filters.direction, filters.page, filters.search, filters.status]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitCreate = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await createDocument({
      direction: form.direction,
      document_type: form.documentType,
      priority: form.priority,
      title: form.title,
      subject: form.subject,
      document_date: form.documentDate,
      category: form.category || undefined,
      source_party: form.sourceParty || undefined,
      target_party: form.targetParty || undefined,
      source_name: form.sourceName || undefined,
      target_name: form.targetName || undefined,
      needs_reply: form.needsReply,
      reply_due_date: form.replyDueDate || undefined,
      notes: form.notes || undefined,
    });
    if (!result.success) {
      setPending(false);
      setError(result.error.message);
      return;
    }
    const uploadResult = uploaderRef.current?.hasPendingFiles()
      ? await uploaderRef.current.uploadPending(result.data.id)
      : {uploaded: 0, failed: 0, cancelled: 0};
    setPending(false);
    setForm({
      direction: "OUTGOING",
      documentType: "LETTER",
      priority: "NORMAL",
      title: "",
      subject: "",
      documentDate: "",
      category: "",
      sourceParty: "",
      targetParty: "",
      sourceName: "",
      targetName: "",
      needsReply: false,
      replyDueDate: "",
      notes: "",
    });
    setCreatedDocumentId(result.data.id);
    setMessage(uploadResult.failed || uploadResult.cancelled ? t("createdWithAttachmentFailures") : t("created"));
    await load();
  };

  if (!hasCapability("school.documents")) {
    return <UnsupportedState />;
  }

  if (!access.can(SCHOOL_PERMISSIONS.documentsRead)) {
    return <ForbiddenState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {message ? <InlineSuccess message={message} /> : null}
      {error ? <InlineError message={error} /> : null}
      {overview ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailItem label={t("overviewTotal")} value={overview.total} />
          <DetailItem label={t("overviewIncoming")} value={overview.incoming} />
          <DetailItem label={t("overviewOutgoing")} value={overview.outgoing} />
          <DetailItem label={t("overviewNeedsReply")} value={overview.needsReply} />
        </div>
      ) : null}
      <Card title={t("filtersTitle")}>
        <div className="grid gap-3 md:grid-cols-4">
          <Input value={filters.search ?? ""} onChange={(event) => updateFilters({...filters, search: event.target.value, page: "1"})} placeholder={t("searchPlaceholder")} />
          <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={filters.status ?? ""} onChange={(event) => updateFilters({...filters, status: event.target.value, page: "1"})}>
            <option value="">{t("allStatuses")}</option>
            {DOCUMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
          <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={filters.direction ?? ""} onChange={(event) => updateFilters({...filters, direction: event.target.value, page: "1"})}>
            <option value="">{t("allDirections")}</option>
            {DOCUMENT_DIRECTIONS.map((direction) => (
              <option key={direction} value={direction}>
                {directionLabel(direction)}
              </option>
            ))}
          </select>
          <Button type="button" onClick={() => updateFilters({})}>
            {common("clear")}
          </Button>
        </div>
      </Card>
      <Can permission={SCHOOL_PERMISSIONS.documentsCreate}>
        <Card title={t("createTitle")}>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submitCreate(event)}>
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={form.direction} onChange={(event) => setForm({...form, direction: event.target.value})}>
              {DOCUMENT_DIRECTIONS.map((direction) => (
                <option key={direction} value={direction}>
                  {directionLabel(direction)}
                </option>
              ))}
            </select>
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={form.documentType} onChange={(event) => setForm({...form, documentType: event.target.value})}>
              {DOCUMENT_TYPES.map((documentType) => (
                <option key={documentType} value={documentType}>
                  {translateEnum(documentType, documentTypeT, documentTypeTranslationKeys)}
                </option>
              ))}
            </select>
            <Input value={form.title} onChange={(event) => setForm({...form, title: event.target.value})} placeholder={common("title")} required />
            <Input value={form.subject} onChange={(event) => setForm({...form, subject: event.target.value})} placeholder={t("subject")} required />
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={form.priority} onChange={(event) => setForm({...form, priority: event.target.value})}>
              {DOCUMENT_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabel(priority)}
                </option>
              ))}
            </select>
            <Input type="date" value={form.documentDate} onChange={(event) => setForm({...form, documentDate: event.target.value})} required />
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={form.category} onChange={(event) => setForm({...form, category: event.target.value})}>
              <option value="">{t("category")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={form.sourceParty} onChange={(event) => setForm({...form, sourceParty: event.target.value})}>
              <option value="">{t("sourceParty")}</option>
              {parties.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.name}
                </option>
              ))}
            </select>
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={form.targetParty} onChange={(event) => setForm({...form, targetParty: event.target.value})}>
              <option value="">{t("targetParty")}</option>
              {parties.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.name}
                </option>
              ))}
            </select>
            <Input value={form.sourceName} onChange={(event) => setForm({...form, sourceName: event.target.value})} placeholder={t("sourceName")} />
            <Input value={form.targetName} onChange={(event) => setForm({...form, targetName: event.target.value})} placeholder={t("targetName")} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.needsReply} onChange={(event) => setForm({...form, needsReply: event.target.checked})} />
              {t("needsReply")}
            </label>
            <Input type="date" value={form.replyDueDate} onChange={(event) => setForm({...form, replyDueDate: event.target.value})} placeholder={t("replyDueDate")} />
            <div className="md:col-span-2">
              <Textarea value={form.notes} onChange={(event) => setForm({...form, notes: event.target.value})} placeholder={common("notes")} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" loading={pending}>
                {common("create")}
              </Button>
            </div>
          </form>
          <Can permission={SCHOOL_PERMISSIONS.documentsUpdate}>
            <div className="mt-6 border-t pt-6">
              <h3 className="text-sm font-semibold">{t("attachmentsTitle")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("attachmentsAfterCreate")}</p>
              <div className="mt-4">
                <DocumentFileUploader ref={uploaderRef} />
              </div>
            </div>
          </Can>
          {createdDocumentId ? <Link href={`/school/correspondence/${createdDocumentId}`} className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">{t("openCreatedDocument")}</Link> : null}
        </Card>
      </Can>
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {documents ? (
        <Card title={t("listTitle")}>
          <div className="mb-3 flex gap-3 text-sm">
            <Link href="/school/correspondence/categories" className="text-primary">
              {t("manageCategories")}
            </Link>
            <Link href="/school/correspondence/parties" className="text-primary">
              {t("manageParties")}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted">
                <tr>
                  <HeaderCell>{t("documentNumber")}</HeaderCell>
                  <HeaderCell>{common("title")}</HeaderCell>
                  <HeaderCell>{common("status")}</HeaderCell>
                  <HeaderCell>{t("direction")}</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {documents.results.map((document) => (
                  <tr key={document.id} className="border-t">
                    <BodyCell>{document.documentNumber}</BodyCell>
                    <BodyCell>
                      <Link href={`/school/correspondence/${document.id}`} className="font-medium text-primary">
                        {document.title}
                      </Link>
                    </BodyCell>
                    <BodyCell>{statusLabel(document.status)}</BodyCell>
                    <BodyCell>{directionLabel(document.direction)}</BodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            count={documents.count}
            page={Number(filters.page || "1")}
            previousLabel={common("previous")}
            nextLabel={common("next")}
            onPrevious={() => updateFilters({...filters, page: String(Math.max(1, Number(filters.page || "1") - 1))})}
            onNext={() => updateFilters({...filters, page: String(Number(filters.page || "1") + 1)})}
          />
        </Card>
      ) : null}
    </div>
  );
}

export function SchoolDocumentDetailScreen({documentId}: {documentId: string}) {
  const t = useTranslations("documents");
  const common = useTranslations("common");
  const validation = useTranslations("validation");
  const statusT = useTranslations("status");
  const directionT = useTranslations("direction");
  const documentTypeT = useTranslations("documentType");
  const priorityT = useTranslations("priority");
  const relationTypeT = useTranslations("relationType");
  const activityActionT = useTranslations("activityAction");
  const confirmT = useTranslations("confirmations");
  const [document, setDocument] = useState<SchoolDocument | null>(null);
  const [activity, setActivity] = useState<PaginatedResult<SchoolDocumentActivity> | null>(null);
  const [categories, setCategories] = useState<SchoolDocumentCategory[]>([]);
  const [parties, setParties] = useState<SchoolCorrespondenceParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const attachmentUploaderRef = useRef<DocumentFileUploaderHandle | null>(null);
  const replyUploaderRef = useRef<DocumentFileUploaderHandle | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<{id: string; filename: string} | null>(null);
  const [confirmation, setConfirmation] = useState<"sent" | "received" | "delete" | "archive" | "reply" | "link" | null>(null);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    priority: "NORMAL",
    category: "",
    sourceParty: "",
    targetParty: "",
    sourceName: "",
    targetName: "",
    notes: "",
    replyDueDate: "",
  });
  const [replyForm, setReplyForm] = useState({title: "", subject: "", documentDate: "", priority: "NORMAL", notes: ""});
  const [linkForm, setLinkForm] = useState({relatedDocument: "", relationType: "RELATED"});
  const [actionReason, setActionReason] = useState("");

  const statusLabel = (value: string) => translateEnum(value, statusT, statusTranslationKeys);
  const directionLabel = (value: string) => translateEnum(value, directionT, directionTranslationKeys);
  const documentTypeLabel = (value: string) => translateEnum(value, documentTypeT, documentTypeTranslationKeys);
  const priorityLabel = (value: string) => translateEnum(value, priorityT, priorityTranslationKeys);
  const relationTypeLabel = (value: string) => translateEnum(value, relationTypeT, relationTypeTranslationKeys);
  const activityActionLabel = (value: string) => translateEnum(value, activityActionT, activityActionTranslationKeys);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [documentResult, activityResult, categoryResult, partyResult] = await Promise.all([
      fetchDocument(documentId),
      fetchDocumentActivity(documentId, {page: "1"}),
      fetchCategories({page: "1"}),
      fetchParties({page: "1"}),
    ]);
    if (!documentResult.success) {
      setError(documentResult.error.message);
      setLoading(false);
      return;
    }
    setDocument(documentResult.data);
    setForm({
      title: documentResult.data.title,
      subject: documentResult.data.subject,
      priority: documentResult.data.priority,
      category: documentResult.data.categoryId || "",
      sourceParty: documentResult.data.sourcePartyId || "",
      targetParty: documentResult.data.targetPartyId || "",
      sourceName: documentResult.data.sourceName,
      targetName: documentResult.data.targetName,
      notes: documentResult.data.notes,
      replyDueDate: documentResult.data.replyDueDate || "",
    });
    setActivity(activityResult.success ? activityResult.data : null);
    setCategories(categoryResult.success ? categoryResult.data.results : []);
    setParties(partyResult.success ? partyResult.data.results : []);
    setLoading(false);
  }, [documentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await updateDocument(documentId, {
      title: form.title,
      subject: form.subject,
      priority: form.priority,
      category: form.category || undefined,
      source_party: form.sourceParty || undefined,
      target_party: form.targetParty || undefined,
      source_name: form.sourceName || undefined,
      target_name: form.targetName || undefined,
      notes: form.notes || undefined,
      reply_due_date: form.replyDueDate || undefined,
    });
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(t("updated"));
    await load();
  };

  const uploadQueuedAttachments = async () => {
    if (!attachmentUploaderRef.current?.hasPendingFiles()) return;
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await attachmentUploaderRef.current.uploadPending(documentId);
    setPending(false);
    setMessage(result.failed || result.cancelled ? t("attachmentsPartialFailure") : t("attachmentUploaded"));
    await load();
  };

  const run = async (action: "sent" | "received" | "delete" | "archive" | "reply" | "link") => {
    if ((action === "sent" || action === "received" || action === "delete" || action === "archive") && !actionReason.trim()) {
      setError(t("auditReasonRequired"));
      return;
    }
    if (action === "reply" && (!replyForm.title.trim() || !replyForm.subject.trim() || !replyForm.documentDate)) {
      setError(validation("required"));
      return;
    }
    if (action === "link" && (!linkForm.relatedDocument.trim() || linkForm.relatedDocument === documentId)) {
      setError(validation("required"));
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    const result =
      action === "sent"
        ? await markDocumentSent(documentId, new Date().toISOString(), actionReason)
        : action === "received"
          ? await markDocumentReceived(documentId, new Date().toISOString(), actionReason)
          : action === "delete"
            ? await deleteDocument(documentId, actionReason)
            : action === "archive"
              ? await archiveDocument(documentId, actionReason)
              : action === "reply"
                ? await createReplyDocument(documentId, {
                    title: replyForm.title,
                    subject: replyForm.subject,
                    document_date: replyForm.documentDate,
                    priority: replyForm.priority,
                    notes: replyForm.notes || undefined,
                  })
                : await linkDocument(documentId, linkForm.relatedDocument, linkForm.relationType);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    const replyDocumentId = action === "reply" && typeof result.data === "object" && result.data !== null && "id" in result.data && typeof result.data.id === "string"
      ? result.data.id
      : null;
    const replyUpload = replyDocumentId && replyUploaderRef.current?.hasPendingFiles()
      ? await replyUploaderRef.current.uploadPending(replyDocumentId)
      : null;
    setMessage(
      action === "sent"
        ? t("markedSent")
        : action === "received"
          ? t("markedReceived")
          : action === "delete"
            ? t("deleted")
            : action === "archive"
              ? t("archived")
              : action === "reply"
                ? replyUpload && (replyUpload.failed || replyUpload.cancelled) ? t("replyCreatedWithAttachmentFailures") : t("replyCreated")
                : t("linked"),
    );
    if (action === "sent" || action === "received" || action === "delete" || action === "archive") {
      setActionReason("");
    }
    await load();
  };

  const requestAction = (action: "sent" | "received" | "delete" | "archive" | "reply" | "link") => {
    setConfirmation(action);
  };

  const confirmationDescription = confirmation === "sent"
    ? confirmT("markDocumentSent")
    : confirmation === "received"
      ? confirmT("markDocumentReceived")
      : confirmation === "delete"
        ? confirmT("deleteDocument")
        : confirmation === "archive"
          ? confirmT("archiveDocument")
          : confirmation === "reply"
            ? confirmT("createReply")
            : confirmT("linkDocument");

  if (loading) {
    return <LoadingBlock label={common("loading")} />;
  }

  if (!hasCapability("school.documents")) {
    return <UnsupportedState />;
  }

  if (error || !document) {
    return <ErrorState onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={document.title} description={document.documentNumber} />
      {message ? <InlineSuccess message={message} /> : null}
      {error ? <InlineError message={error} /> : null}
      <Card title={t("detailTitle")}>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailItem label={t("documentNumber")} value={document.documentNumber} />
          <DetailItem label={common("status")} value={statusLabel(document.status)} />
          <DetailItem label={t("direction")} value={directionLabel(document.direction)} />
          <DetailItem label={t("documentType")} value={documentTypeLabel(document.documentType)} />
        </div>
      </Card>
      <Can permission={SCHOOL_PERMISSIONS.documentsUpdate}>
        <Card title={t("editTitle")}>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void save(event)}>
            <Input value={form.title} onChange={(event) => setForm({...form, title: event.target.value})} placeholder={common("title")} required />
            <Input value={form.subject} onChange={(event) => setForm({...form, subject: event.target.value})} placeholder={t("subject")} required />
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={form.priority} onChange={(event) => setForm({...form, priority: event.target.value})}>
              {DOCUMENT_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabel(priority)}
                </option>
              ))}
            </select>
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={form.category} onChange={(event) => setForm({...form, category: event.target.value})}>
              <option value="">{t("category")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Input type="date" value={form.replyDueDate} onChange={(event) => setForm({...form, replyDueDate: event.target.value})} />
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={form.sourceParty} onChange={(event) => setForm({...form, sourceParty: event.target.value})}>
              <option value="">{t("sourceParty")}</option>
              {parties.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.name}
                </option>
              ))}
            </select>
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={form.targetParty} onChange={(event) => setForm({...form, targetParty: event.target.value})}>
              <option value="">{t("targetParty")}</option>
              {parties.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.name}
                </option>
              ))}
            </select>
            <Input value={form.sourceName} onChange={(event) => setForm({...form, sourceName: event.target.value})} placeholder={t("sourceName")} />
            <Input value={form.targetName} onChange={(event) => setForm({...form, targetName: event.target.value})} placeholder={t("targetName")} />
            <div className="md:col-span-2">
              <Textarea value={form.notes} onChange={(event) => setForm({...form, notes: event.target.value})} placeholder={common("notes")} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" loading={pending}>
                {common("save")}
              </Button>
            </div>
          </form>
        </Card>
      </Can>
      <Card title={t("attachmentsTitle")}>
        <Can permission={SCHOOL_PERMISSIONS.documentsUpdate}>
          <DocumentFileUploader ref={attachmentUploaderRef} documentId={documentId} />
          <div className="mt-4 flex justify-end">
            <Button type="button" loading={pending} onClick={() => void uploadQueuedAttachments()}>
              {t("uploadPdf")}
            </Button>
          </div>
        </Can>
        <div className="mt-4 space-y-3">
          {document.attachments.length ? document.attachments.map((attachment) => (
            <div key={attachment.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium" dir="auto">{attachment.originalFilename}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{attachment.mimeType} · {attachment.fileSize} B</p>
                  {attachment.isPrimary ? <p className="mt-2 text-xs font-semibold text-primary">{t("officialCopy")}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Can permission={SCHOOL_PERMISSIONS.documentsPreview}>
                    <Button type="button" variant="outline" size="sm" onClick={() => setPreviewAttachment({id: attachment.id, filename: attachment.originalFilename})}>{common("preview")}</Button>
                  </Can>
                  <Can permission={SCHOOL_PERMISSIONS.documentsDownload}>
                    <a href={gatewayHref("school", schoolEndpoints.documents.download(documentId, attachment.id))} className="inline-flex min-h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" download>{common("download")}</a>
                  </Can>
                </div>
              </div>
            </div>
          )) : <p className="text-sm text-muted-foreground">{t("attachmentsEmpty")}</p>}
        </div>
      </Card>
      <Card title={t("actionsTitle")}>
        <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-md border p-4">
              <p className="font-medium">{t("statusActions")}</p>
              <Input value={actionReason} onChange={(event) => setActionReason(event.target.value)} placeholder={t("auditReason")} />
              <p className="text-xs text-muted-foreground">{t("auditReasonDescription")}</p>
              <div className="flex flex-wrap gap-2">
                <Can permission={SCHOOL_PERMISSIONS.outgoingMarkSent}>
                  <Button type="button" loading={pending} onClick={() => requestAction("sent")} disabled={document.direction !== "OUTGOING"}>
                    {t("markSent")}
                  </Button>
                </Can>
                <Can permission={SCHOOL_PERMISSIONS.incomingMarkReceived}>
                  <Button type="button" loading={pending} onClick={() => requestAction("received")} disabled={document.direction !== "INCOMING"}>
                    {t("markReceived")}
                  </Button>
                </Can>
              <Can permission={SCHOOL_PERMISSIONS.documentsDelete}>
                <Button type="button" className="bg-danger text-danger-foreground" loading={pending} onClick={() => requestAction("delete")}>
                  {common("delete")}
                </Button>
              </Can>
            </div>
          </div>
          <Can permission={SCHOOL_PERMISSIONS.documentsArchive}>
            <div className="space-y-3 rounded-md border p-4">
              <p className="font-medium">{common("archive")}</p>
              <p className="text-xs text-muted-foreground">{t("archiveReasonDescription")}</p>
              <Button type="button" loading={pending} onClick={() => requestAction("archive")}>
                {common("archive")}
              </Button>
            </div>
          </Can>
          <Can permission={SCHOOL_PERMISSIONS.documentsCreate}>
            <div className="space-y-3 rounded-md border p-4">
              <p className="font-medium">{t("replyTitle")}</p>
              <Input value={replyForm.title} onChange={(event) => setReplyForm({...replyForm, title: event.target.value})} placeholder={common("title")} />
              <Input value={replyForm.subject} onChange={(event) => setReplyForm({...replyForm, subject: event.target.value})} placeholder={t("subject")} />
              <Input type="date" value={replyForm.documentDate} onChange={(event) => setReplyForm({...replyForm, documentDate: event.target.value})} />
              <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={replyForm.priority} onChange={(event) => setReplyForm({...replyForm, priority: event.target.value})}>
                {DOCUMENT_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabel(priority)}
                  </option>
                ))}
              </select>
              <Textarea value={replyForm.notes} onChange={(event) => setReplyForm({...replyForm, notes: event.target.value})} placeholder={common("notes")} />
              <Can permission={SCHOOL_PERMISSIONS.documentsUpdate}>
                <DocumentFileUploader ref={replyUploaderRef} />
              </Can>
              <Button type="button" loading={pending} onClick={() => requestAction("reply")}>
                {t("createReply")}
              </Button>
            </div>
          </Can>
          <Can permission={SCHOOL_PERMISSIONS.documentsLink}>
            <div className="space-y-3 rounded-md border p-4">
              <p className="font-medium">{t("linkTitle")}</p>
              <Input value={linkForm.relatedDocument} onChange={(event) => setLinkForm({...linkForm, relatedDocument: event.target.value})} placeholder={t("relatedDocumentId")} />
              <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={linkForm.relationType} onChange={(event) => setLinkForm({...linkForm, relationType: event.target.value})}>
                {DOCUMENT_RELATION_TYPES.map((relationType) => (
                  <option key={relationType} value={relationType}>
                    {relationTypeLabel(relationType)}
                  </option>
                ))}
              </select>
              <Button type="button" loading={pending} onClick={() => requestAction("link")}>
                {t("linkDocument")}
              </Button>
            </div>
          </Can>
        </div>
      </Card>
      {activity ? (
        <Card title={t("activityTitle")}>
          <div className="space-y-3">
            {activity.results.map((entry) => (
              <div key={entry.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{activityActionLabel(entry.action)}</p>
                <p className="mt-1 text-muted-foreground">{entry.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{entry.createdAt}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
      {previewAttachment ? <DocumentPreviewDialog open={Boolean(previewAttachment)} onOpenChange={(open) => !open && setPreviewAttachment(null)} documentId={documentId} attachmentId={previewAttachment.id} filename={previewAttachment.filename} /> : null}
      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => !open && setConfirmation(null)}
        title={t("actionsTitle")}
        description={confirmationDescription}
        confirmLabel={common("save")}
        cancelLabel={common("cancel")}
        variant={confirmation === "delete" ? "danger" : "primary"}
        loading={pending}
        onConfirm={() => {
          if (!confirmation) return;
          const action = confirmation;
          setConfirmation(null);
          void run(action);
        }}
      />
    </div>
  );
}

export function SchoolCategoriesScreen() {
  return <CollectionManager mode="category" />;
}

export function SchoolPartiesScreen() {
  return <CollectionManager mode="party" />;
}

function CollectionManager({mode}: {mode: "category" | "party"}) {
  const t = useTranslations(mode === "category" ? "documentCategories" : "correspondenceParties");
  const common = useTranslations("common");
  const partyTypeT = useTranslations("partyType");
  const confirmT = useTranslations("confirmations");
  const access = usePortalSession();
  const permission = mode === "category" ? SCHOOL_PERMISSIONS.documentsManageCategories : SCHOOL_PERMISSIONS.documentsManageParties;
  const [rows, setRows] = useState<PaginatedResult<SchoolDocumentCategory | SchoolCorrespondenceParty> | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>(
    mode === "category"
      ? {name: "", code: "", parent: "", description: "", isActive: true}
      : {name: "", partyType: "OTHER", phone: "", email: "", address: "", notes: "", isActive: true},
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = mode === "category" ? await fetchCategories({page: "1"}) : await fetchParties({page: "1"});
    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    setRows(result.data as PaginatedResult<SchoolDocumentCategory | SchoolCorrespondenceParty>);
    setLoading(false);
  }, [mode]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const result =
      mode === "category"
        ? selectedId
          ? await updateCategory(selectedId, {
              name: form.name,
              code: form.code,
              parent: form.parent || undefined,
              description: form.description,
              is_active: form.isActive,
            })
          : await createCategory({
              name: form.name,
              code: form.code,
              parent: form.parent || undefined,
              description: form.description,
              is_active: form.isActive,
            })
        : selectedId
          ? await updateParty(selectedId, {
              name: form.name,
              party_type: form.partyType,
              phone: form.phone,
              email: form.email,
              address: form.address,
              notes: form.notes,
              is_active: form.isActive,
            })
          : await createParty({
              name: form.name,
              party_type: form.partyType,
              phone: form.phone,
              email: form.email,
              address: form.address,
              notes: form.notes,
              is_active: form.isActive,
            });
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(selectedId ? t("updated") : t("created"));
    setSelectedId(null);
    setForm(
      mode === "category"
        ? {name: "", code: "", parent: "", description: "", isActive: true}
        : {name: "", partyType: "OTHER", phone: "", email: "", address: "", notes: "", isActive: true},
    );
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm(mode === "category" ? confirmT("deleteCategory") : confirmT("deleteParty"))) {
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    const result = mode === "category" ? await deleteCategory(id) : await deleteParty(id);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(t("deleted"));
    await load();
  };

  const partyTypeLabel = (value: string) => translateEnum(value, partyTypeT, partyTypeTranslationKeys);

  if (mode === "category" && !hasCapability("school.documentCategories")) {
    return <UnsupportedState />;
  }

  if (mode === "party" && !hasCapability("school.correspondenceParties")) {
    return <UnsupportedState />;
  }

  if (!access.can(permission)) {
    return <ForbiddenState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {message ? <InlineSuccess message={message} /> : null}
      {error ? <InlineError message={error} /> : null}
      <Card title={selectedId ? t("editTitle") : t("createTitle")}>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submit(event)}>
          <Input value={String(form.name ?? "")} onChange={(event) => setForm({...form, name: event.target.value})} placeholder={t("name")} required />
          {"code" in form ? (
            <Input value={String(form.code ?? "")} onChange={(event) => setForm({...form, code: event.target.value})} placeholder={t("code")} required />
          ) : (
            <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={String(form.partyType ?? "OTHER")} onChange={(event) => setForm({...form, partyType: event.target.value})}>
              {PARTY_TYPES.map((partyType) => (
                <option key={partyType} value={partyType}>
                  {partyTypeLabel(partyType)}
                </option>
              ))}
            </select>
          )}
          {"parent" in form ? (
            <Input value={String(form.parent ?? "")} onChange={(event) => setForm({...form, parent: event.target.value})} placeholder={t("parent")} />
          ) : (
            <Input value={String(form.phone ?? "")} onChange={(event) => setForm({...form, phone: event.target.value})} placeholder={common("phone")} />
          )}
          {"address" in form ? (
            <Input value={String(form.email ?? "")} onChange={(event) => setForm({...form, email: event.target.value})} placeholder={common("email")} />
          ) : null}
          {"address" in form ? (
            <Input value={String(form.address ?? "")} onChange={(event) => setForm({...form, address: event.target.value})} placeholder={common("address")} />
          ) : null}
          <div className="md:col-span-2">
            {"notes" in form ? (
              <Textarea value={String(form.notes ?? "")} onChange={(event) => setForm({...form, notes: event.target.value})} placeholder={common("notes")} />
            ) : (
              <Textarea value={String(form.description ?? "")} onChange={(event) => setForm({...form, description: event.target.value})} placeholder={common("description")} />
            )}
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={Boolean(form.isActive)} onChange={(event) => setForm({...form, isActive: event.target.checked})} />
            {common("active")}
          </label>
          <div className="md:col-span-2">
            <Button type="submit" loading={pending}>
              {selectedId ? common("save") : common("create")}
            </Button>
          </div>
        </form>
      </Card>
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {rows ? (
        <Card title={t("listTitle")}>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted">
                <tr>
                  <HeaderCell>{t("name")}</HeaderCell>
                  <HeaderCell>{mode === "category" ? t("code") : t("partyType")}</HeaderCell>
                  <HeaderCell>{common("actions")}</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {rows.results.map((row) => (
                  <tr key={row.id} className="border-t">
                    <BodyCell>{row.name}</BodyCell>
                    <BodyCell>{mode === "category" ? (row as SchoolDocumentCategory).code : partyTypeLabel((row as SchoolCorrespondenceParty).partyType)}</BodyCell>
                    <BodyCell>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          className="bg-secondary text-secondary-foreground"
                          onClick={() => {
                            setSelectedId(row.id);
                            setForm(
                              mode === "category"
                                ? {
                                    name: (row as SchoolDocumentCategory).name,
                                    code: (row as SchoolDocumentCategory).code,
                                    parent: (row as SchoolDocumentCategory).parent || "",
                                    description: (row as SchoolDocumentCategory).description,
                                    isActive: (row as SchoolDocumentCategory).isActive,
                                  }
                                : {
                                    name: (row as SchoolCorrespondenceParty).name,
                                    partyType: (row as SchoolCorrespondenceParty).partyType,
                                    phone: (row as SchoolCorrespondenceParty).phone,
                                    email: (row as SchoolCorrespondenceParty).email,
                                    address: (row as SchoolCorrespondenceParty).address,
                                    notes: (row as SchoolCorrespondenceParty).notes,
                                    isActive: (row as SchoolCorrespondenceParty).isActive,
                                  },
                            );
                          }}
                        >
                          {common("edit")}
                        </Button>
                        <Button type="button" className="bg-danger text-danger-foreground" loading={pending} onClick={() => void remove(row.id)}>
                          {common("delete")}
                        </Button>
                      </div>
                    </BodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
