"use client";

import {useCallback, useEffect, useState} from "react";
import {useTranslations} from "next-intl";

import {Can} from "@/components/auth/can";
import {ForbiddenState, UnsupportedState} from "@/components/feedback/states";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {hasCapability} from "@/config/capabilities";
import {SCHOOL_PERMISSIONS} from "@/config/permissions";
import {
  TICKET_STATUSES,
  priorityTranslationKeys,
  statusTranslationKeys,
  translateEnum,
} from "@/lib/presentation/domain-enums";
import {usePortalSession} from "@/providers/auth-provider";

import {assignSchoolTicket, closeSchoolTicket, escalateSchoolTicket, fetchSchoolTickets} from "../services/school-api";
import type {SchoolTicket} from "../types/contracts";
import {BodyCell, Card, HeaderCell, InlineError, InlineSuccess, LoadingBlock, PageHeader} from "./common";

export function SchoolTicketsScreen() {
  const t = useTranslations("schoolTickets");
  const common = useTranslations("common");
  const statusT = useTranslations("status");
  const priorityT = useTranslations("priority");
  const confirmT = useTranslations("confirmations");
  const access = usePortalSession();
  const [tickets, setTickets] = useState<SchoolTicket[]>([]);
  const [selected, setSelected] = useState<SchoolTicket | null>(null);
  const [assignedTo, setAssignedTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    setAssignedTo(selected.assignedTo || "");
  }, [selected]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchSchoolTickets({status: statusFilter || undefined});
    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    setTickets(result.data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (action: "assign" | "close" | "escalate") => {
    if (!selected) return;
    if (action === "close" && !window.confirm(confirmT("closeSchoolTicket"))) {
      return;
    }
    if (action === "escalate" && !window.confirm(confirmT("escalateSchoolTicket"))) {
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    const result =
      action === "assign"
        ? await assignSchoolTicket(selected.id, assignedTo)
        : action === "close"
          ? await closeSchoolTicket(selected.id)
          : await escalateSchoolTicket(selected.id);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setMessage(action === "assign" ? t("assigned") : action === "close" ? t("closed") : t("escalated"));
    await load();
  };

  const statusLabel = (value: string) => translateEnum(value, statusT, statusTranslationKeys);
  const priorityLabel = (value: string) => translateEnum(value, priorityT, priorityTranslationKeys);

  if (!hasCapability("school.tickets")) {
    return <UnsupportedState />;
  }

  if (!access.can(SCHOOL_PERMISSIONS.ticketsView)) {
    return <ForbiddenState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {message ? <InlineSuccess message={message} /> : null}
      {error ? <InlineError message={error} /> : null}
      <Card title={t("filtersTitle")}>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <select className="min-h-11 rounded-md border bg-background px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">{t("allStatuses")}</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
          <Button type="button" onClick={() => setStatusFilter("")}>
            {common("clear")}
          </Button>
        </div>
      </Card>
      {loading ? <LoadingBlock label={common("loading")} /> : null}
      <Card title={t("listTitle")}>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-muted">
              <tr>
                <HeaderCell>{common("title")}</HeaderCell>
                <HeaderCell>{common("status")}</HeaderCell>
                <HeaderCell>{t("priority")}</HeaderCell>
                <HeaderCell>{t("assignedTo")}</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t">
                  <BodyCell>
                    <button type="button" className="font-medium text-primary" onClick={() => setSelected(ticket)}>
                      {ticket.title}
                    </button>
                  </BodyCell>
                  <BodyCell>{statusLabel(ticket.status)}</BodyCell>
                  <BodyCell>{priorityLabel(ticket.priority)}</BodyCell>
                  <BodyCell>{ticket.assignedTo || common("none")}</BodyCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {selected ? (
        <Card title={t("actionsTitle")}>
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} placeholder={t("assignUserId")} />
            <div className="flex flex-wrap gap-2">
              <Can permission={SCHOOL_PERMISSIONS.ticketsAssign}>
                <Button type="button" loading={pending} onClick={() => void run("assign")}>
                  {t("assign")}
                </Button>
              </Can>
              <Can permission={SCHOOL_PERMISSIONS.ticketsClose}>
                <Button type="button" loading={pending} onClick={() => void run("close")}>
                  {t("close")}
                </Button>
              </Can>
              <Can permission={SCHOOL_PERMISSIONS.ticketsEscalate}>
                <Button type="button" className="bg-secondary text-secondary-foreground" loading={pending} onClick={() => void run("escalate")}>
                  {t("escalate")}
                </Button>
              </Can>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
