"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {usePathname, useSearchParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";

import {FilteredEmptyState, ForbiddenState, UnsupportedState} from "@/components/feedback/states";
import {
  ActiveFilterChips,
  BodyCell,
  Card,
  FilterBar,
  HeaderCell,
  InlineError,
  LoadingBlock,
  MobileRecordCard,
  PageHeader,
  PageStack,
  Pagination,
  ResponsiveTable,
  TableScroller,
} from "@/features/school/components/common";
import {buttonClassName} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select} from "@/components/ui/select";
import {Link} from "@/i18n/routing";
import {hasCapability} from "@/config/capabilities";
import {SCHOOL_PERMISSIONS} from "@/config/permissions";
import {formatDate} from "@/lib/formatting/dates";
import {usePortalSession} from "@/providers/auth-provider";

import {fetchCategories, fetchDocumentOverview, fetchDocuments, fetchParties} from "../services/school-api";
import type {PaginatedResult, SchoolCorrespondenceParty, SchoolDocument, SchoolDocumentCategory, SchoolDocumentOverview} from "../types/contracts";

type Filters = Record<string, string>;

function readFilters(searchParams: Readonly<{get(name: string): string | null}>): Filters {
  const filters: Filters = {};
  ["search", "direction", "category", "target_party", "document_date_from", "document_date_to", "page"].forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      filters[key] = value;
    }
  });
  return filters;
}

export function SchoolArchiveScreen() {
  const t = useTranslations("archive");
  const documentsT = useTranslations("documents");
  const common = useTranslations("common");
  const locale = useLocale();
  const access = usePortalSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => readFilters(searchParams));
  const [overview, setOverview] = useState<SchoolDocumentOverview | null>(null);
  const [documents, setDocuments] = useState<PaginatedResult<SchoolDocument> | null>(null);
  const [categories, setCategories] = useState<SchoolDocumentCategory[]>([]);
  const [parties, setParties] = useState<SchoolCorrespondenceParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeFilters = useMemo(
    () =>
      Object.entries(filters)
        .filter(([key, value]) => key !== "page" && Boolean(value))
        .map(([key, value]) => ({key, label: t(`filterLabels.${key}`), value})),
    [filters, t],
  );

  const updateFilters = (next: Filters) => {
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
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

    const [overviewResult, documentsResult, categoriesResult, partiesResult] = await Promise.all([
      fetchDocumentOverview(),
      fetchDocuments({
        search: filters.search || undefined,
        status: "ARCHIVED",
        direction: filters.direction || undefined,
        category: filters.category || undefined,
        target_party: filters.target_party || undefined,
        document_date_from: filters.document_date_from || undefined,
        document_date_to: filters.document_date_to || undefined,
        page: filters.page || "1",
      }),
      fetchCategories({page: "1"}),
      fetchParties({page: "1"}),
    ]);

    if (!documentsResult.success) {
      setError(documentsResult.error.message);
      setLoading(false);
      return;
    }

    setOverview(overviewResult.success ? overviewResult.data : null);
    setDocuments(documentsResult.data);
    setCategories(categoriesResult.success ? categoriesResult.data.results : []);
    setParties(partiesResult.success ? partiesResult.data.results : []);
    setLoading(false);
  }, [filters.category, filters.direction, filters.document_date_from, filters.document_date_to, filters.page, filters.search, filters.target_party]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!hasCapability("school.archive")) {
    return <UnsupportedState />;
  }

  if (!access.can(SCHOOL_PERMISSIONS.documentsRead)) {
    return <ForbiddenState />;
  }

  return (
    <PageStack>
      <PageHeader title={t("title")} description={t("description")} />
      <Card title={t("statusTitle")} description={t("statusDescription")}>
        <p className="text-sm text-muted-foreground">
          {t("archivedCount", {count: overview?.archived ?? 0})}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t("backendLimitation")}</p>
      </Card>
      {error ? <InlineError message={error} /> : null}
      <FilterBar>
        <Input aria-label={documentsT("searchPlaceholder")} value={filters.search ?? ""} onChange={(event) => updateFilters({...filters, search: event.target.value, page: "1"})} placeholder={documentsT("searchPlaceholder")} />
        <Select aria-label={documentsT("direction")} value={filters.direction ?? ""} onChange={(event) => updateFilters({...filters, direction: event.target.value, page: "1"})}>
          <option value="">{documentsT("allDirections")}</option>
          <option value="OUTGOING">{t("outgoing")}</option>
          <option value="INCOMING">{t("incoming")}</option>
          <option value="INTERNAL">{t("internal")}</option>
        </Select>
        <Select aria-label={documentsT("category")} value={filters.category ?? ""} onChange={(event) => updateFilters({...filters, category: event.target.value, page: "1"})}>
          <option value="">{documentsT("category")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select aria-label={documentsT("targetParty")} value={filters.target_party ?? ""} onChange={(event) => updateFilters({...filters, target_party: event.target.value, page: "1"})}>
          <option value="">{documentsT("targetParty")}</option>
          {parties.map((party) => (
            <option key={party.id} value={party.id}>
              {party.name}
            </option>
          ))}
        </Select>
        <Input aria-label={t("fromDate")} type="date" value={filters.document_date_from ?? ""} onChange={(event) => updateFilters({...filters, document_date_from: event.target.value, page: "1"})} />
        <Input aria-label={t("toDate")} type="date" value={filters.document_date_to ?? ""} onChange={(event) => updateFilters({...filters, document_date_to: event.target.value, page: "1"})} />
      </FilterBar>
      <ActiveFilterChips
        items={activeFilters}
        clearLabel={common("clear")}
        clearAllLabel={t("clearFilters")}
        onClear={(key) => updateFilters({...filters, [key]: "", page: "1"})}
        onClearAll={() => updateFilters({})}
      />
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      {!loading && documents && documents.results.length === 0 ? (
        Object.entries(filters).some(([key, value]) => key !== "page" && Boolean(value)) ? (
          <FilteredEmptyState title={t("filteredEmptyTitle")} description={t("filteredEmptyDescription")} />
        ) : (
          <FilteredEmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
        )
      ) : null}
      {documents && documents.results.length > 0 ? (
        <Card title={t("listTitle")}>
          <div className="hidden md:block">
            <TableScroller>
              <ResponsiveTable>
                <thead className="bg-muted">
                  <tr>
                    <HeaderCell>{documentsT("documentNumber")}</HeaderCell>
                    <HeaderCell>{common("title")}</HeaderCell>
                    <HeaderCell>{common("date")}</HeaderCell>
                    <HeaderCell>{documentsT("direction")}</HeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {documents.results.map((document) => (
                    <tr key={document.id} className="border-t">
                      <BodyCell>{document.documentNumber}</BodyCell>
                      <BodyCell>
                        <Link href={`/school/correspondence/${document.id}`} className="font-medium text-primary underline-offset-4 hover:underline">
                          {document.title}
                        </Link>
                      </BodyCell>
                      <BodyCell>{formatDate(document.documentDate, locale)}</BodyCell>
                      <BodyCell>{document.direction}</BodyCell>
                    </tr>
                  ))}
                </tbody>
              </ResponsiveTable>
            </TableScroller>
          </div>
          <div className="grid gap-3 md:hidden">
            {documents.results.map((document) => (
              <MobileRecordCard
                key={document.id}
                title={document.title}
                subtitle={document.documentNumber}
                actions={
                  <Link href={`/school/correspondence/${document.id}`} className={buttonClassName({variant: "secondary"})}>
                    {common("preview")}
                  </Link>
                }
              >
                <p>{formatDate(document.documentDate, locale)}</p>
                <p className="text-xs text-muted-foreground">{document.direction}</p>
              </MobileRecordCard>
            ))}
          </div>
          <Pagination
            count={documents.count}
            page={Number(filters.page ?? "1")}
            previousLabel={common("previous")}
            nextLabel={common("next")}
            onPrevious={() => updateFilters({...filters, page: String(Math.max(1, Number(filters.page ?? "1") - 1))})}
            onNext={() => updateFilters({...filters, page: String(Number(filters.page ?? "1") + 1)})}
          />
        </Card>
      ) : null}
    </PageStack>
  );
}
