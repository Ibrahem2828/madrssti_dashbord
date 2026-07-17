"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {usePathname, useSearchParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";

import {ErrorState, FilteredEmptyState, ForbiddenState, UnsupportedState} from "@/components/feedback/states";
import {buttonClassName} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select} from "@/components/ui/select";
import {Link} from "@/i18n/routing";
import {hasCapability} from "@/config/capabilities";
import {SCHOOL_PERMISSIONS} from "@/config/permissions";
import {formatDate} from "@/lib/formatting/dates";
import {
  DOCUMENT_STATUSES,
  activityActionTranslationKeys,
  directionTranslationKeys,
  documentTypeTranslationKeys,
  statusTranslationKeys,
  translateEnum,
} from "@/lib/presentation/domain-enums";
import {usePortalSession} from "@/providers/auth-provider";

import {type SchoolDocumentListMode, schoolDocumentModeConfig} from "../config/documents";
import {
  fetchCategories,
  fetchCircularDocuments,
  fetchDocuments,
  fetchIncomingDocuments,
  fetchNeedsReplyDocuments,
  fetchOutgoingDocuments,
  fetchParties,
} from "../services/school-api";
import type {PaginatedResult, SchoolCorrespondenceParty, SchoolDocument, SchoolDocumentCategory} from "../types/contracts";
import {
  ActiveFilterChips,
  BodyCell,
  Card,
  FilterBar,
  HeaderCell,
  LoadingBlock,
  MobileRecordCard,
  PageHeader,
  PageStack,
  Pagination,
  ResponsiveTable,
  TableScroller,
  readFilters,
} from "./common";

type CollectionMode = Exclude<SchoolDocumentListMode, "all" | "archive">;
type Filters = Record<string, string>;

const filterKeys = ["search", "status", "direction", "document_type", "category", "target_party", "needs_reply", "page"] as const;

function mergeModeDefaults(mode: CollectionMode, filters: Filters): Filters {
  return {...schoolDocumentModeConfig[mode].defaultFilters, ...filters};
}

function buildQuery(filters: Filters) {
  return {
    search: filters.search || undefined,
    status: filters.status || undefined,
    direction: filters.direction || undefined,
    document_type: filters.document_type || undefined,
    category: filters.category || undefined,
    target_party: filters.target_party || undefined,
    needs_reply: filters.needs_reply || undefined,
    page: filters.page || "1",
  };
}

function fetchByMode(mode: CollectionMode, query: ReturnType<typeof buildQuery>) {
  switch (mode) {
    case "outgoing":
      return fetchOutgoingDocuments(query);
    case "incoming":
      return fetchIncomingDocuments(query);
    case "circulars":
      return fetchCircularDocuments(query);
    case "needs-reply":
      return fetchNeedsReplyDocuments(query);
    default:
      return fetchDocuments(query);
  }
}

export function SchoolDocumentCollectionScreen({mode}: {mode: CollectionMode}) {
  const t = useTranslations("documents");
  const common = useTranslations("common");
  const statusT = useTranslations("status");
  const directionT = useTranslations("direction");
  const documentTypeT = useTranslations("documentType");
  const locale = useLocale();
  const access = usePortalSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const modeConfig = schoolDocumentModeConfig[mode];
  const [filters, setFilters] = useState<Filters>(() => mergeModeDefaults(mode, readFilters(searchParams, filterKeys)));
  const [documents, setDocuments] = useState<PaginatedResult<SchoolDocument> | null>(null);
  const [categories, setCategories] = useState<SchoolDocumentCategory[]>([]);
  const [parties, setParties] = useState<SchoolCorrespondenceParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{message: string; requestId?: string} | null>(null);

  useEffect(() => {
    setFilters(mergeModeDefaults(mode, readFilters(searchParams, filterKeys)));
  }, [mode, searchParams]);

  const statusLabel = (value: string) => translateEnum(value, statusT, statusTranslationKeys);
  const directionLabel = (value: string) => translateEnum(value, directionT, directionTranslationKeys);
  const documentTypeLabel = (value: string) => translateEnum(value, documentTypeT, documentTypeTranslationKeys);

  const activeFilters = useMemo(
    () => Object.entries(filters).filter(([key, value]) => key !== "page" && Boolean(value)).map(([key, value]) => ({key, label: t(`filterLabels.${key}`), value})),
    [filters, t],
  );

  const updateFilters = (next: Filters) => {
    const merged = mergeModeDefaults(mode, next);
    setFilters(merged);
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const query = buildQuery(filters);
    const [documentsResult, categoriesResult, partiesResult] = await Promise.all([
      fetchByMode(mode, query),
      fetchCategories({page: "1"}),
      fetchParties({page: "1"}),
    ]);

    if (!documentsResult.success) {
      setError({message: documentsResult.error.message, requestId: documentsResult.requestId});
      setLoading(false);
      return;
    }

    setDocuments(documentsResult.data);
    setCategories(categoriesResult.success ? categoriesResult.data.results : []);
    setParties(partiesResult.success ? partiesResult.data.results : []);
    setLoading(false);
  }, [filters, mode]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!hasCapability("school.documents")) {
    return <UnsupportedState />;
  }

  if (!access.can(modeConfig.requiredPermission)) {
    return <ForbiddenState />;
  }

  if (error && !documents) {
    return <ErrorState onRetry={() => void load()} requestId={error.requestId} />;
  }

  return (
    <PageStack>
      <PageHeader
        title={t(modeConfig.titleKey)}
        description={t(modeConfig.descriptionKey)}
        actions={<Link href="/school/correspondence/new" className={buttonClassName({variant: "secondary"})}>{t("newDocumentAction")}</Link>}
      />
      <FilterBar actions={<Link href="/school/correspondence" className={buttonClassName({variant: "outline"})}>{t("overviewShortcut")}</Link>}>
        <Input aria-label={t("searchPlaceholder")} value={filters.search ?? ""} onChange={(event) => updateFilters({...filters, search: event.target.value, page: "1"})} placeholder={t("searchPlaceholder")} />
        <Select aria-label={t("allStatuses")} value={filters.status ?? ""} onChange={(event) => updateFilters({...filters, status: event.target.value, page: "1"})}>
          <option value="">{t("allStatuses")}</option>
          {DOCUMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </Select>
        <Select aria-label={t("category")} value={filters.category ?? ""} onChange={(event) => updateFilters({...filters, category: event.target.value, page: "1"})}>
          <option value="">{t("category")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select aria-label={t("targetParty")} value={filters.target_party ?? ""} onChange={(event) => updateFilters({...filters, target_party: event.target.value, page: "1"})}>
          <option value="">{t("targetParty")}</option>
          {parties.map((party) => (
            <option key={party.id} value={party.id}>
              {party.name}
            </option>
          ))}
        </Select>
      </FilterBar>
      <ActiveFilterChips items={activeFilters} clearLabel={common("clear")} clearAllLabel={t("clearFilters")} onClear={(key) => updateFilters({...filters, [key]: "", page: "1"})} onClearAll={() => updateFilters({})} />
      {error ? <Card title={t("listTitle")} description={error.requestId ? `${t("requestIdLabel")}: ${error.requestId}` : error.message}><p className="text-sm text-danger">{error.message}</p></Card> : null}
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {!loading && !error && documents && documents.results.length === 0 ? (
        activeFilters.length > 0 ? <FilteredEmptyState title={t("filteredEmptyTitle")} description={t("filteredEmptyDescription")} /> : <FilteredEmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : null}
      {documents && documents.results.length > 0 ? (
        <Card title={t("listTitle")} description={t("listDescription", {count: documents.count})}>
          <div className="hidden md:block">
            <TableScroller>
              <ResponsiveTable>
                <thead className="bg-muted">
                  <tr>
                    <HeaderCell>{t("documentNumber")}</HeaderCell>
                    <HeaderCell>{common("title")}</HeaderCell>
                    <HeaderCell>{t("documentType")}</HeaderCell>
                    <HeaderCell>{common("status")}</HeaderCell>
                    <HeaderCell>{common("date")}</HeaderCell>
                    <HeaderCell>{common("actions")}</HeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {documents.results.map((document) => (
                    <tr key={document.id} className="border-t">
                      <BodyCell>{document.documentNumber}</BodyCell>
                      <BodyCell>
                        <div className="space-y-1">
                          <Link href={`/school/correspondence/${document.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{document.title}</Link>
                          <p className="text-xs text-muted-foreground">{directionLabel(document.direction)}</p>
                        </div>
                      </BodyCell>
                      <BodyCell>{documentTypeLabel(document.documentType)}</BodyCell>
                      <BodyCell>{statusLabel(document.status)}</BodyCell>
                      <BodyCell>{formatDate(document.documentDate, locale)}</BodyCell>
                      <BodyCell>
                        <Link href={`/school/correspondence/${document.id}`} className={buttonClassName({variant: "outline", size: "sm"})}>
                          {t("viewDocument")}
                        </Link>
                      </BodyCell>
                    </tr>
                  ))}
                </tbody>
              </ResponsiveTable>
            </TableScroller>
          </div>
          <div className="grid gap-3 md:hidden">
            {documents.results.map((document) => (
              <MobileRecordCard key={document.id} title={document.title} subtitle={document.documentNumber} actions={<Link href={`/school/correspondence/${document.id}`} className={buttonClassName({variant: "secondary"})}>{t("viewDocument")}</Link>}>
                <p>{documentTypeLabel(document.documentType)}</p>
                <p>{statusLabel(document.status)}</p>
                <p className="text-xs text-muted-foreground">{directionLabel(document.direction)} • {formatDate(document.documentDate, locale)}</p>
              </MobileRecordCard>
            ))}
          </div>
          <Pagination count={documents.count} page={Number(filters.page ?? "1")} previousLabel={common("previous")} nextLabel={common("next")} onPrevious={() => updateFilters({...filters, page: String(Math.max(1, Number(filters.page ?? "1") - 1))})} onNext={() => updateFilters({...filters, page: String(Number(filters.page ?? "1") + 1)})} />
        </Card>
      ) : null}
    </PageStack>
  );
}
