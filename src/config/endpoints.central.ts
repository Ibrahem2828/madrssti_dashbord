import {endpoint, entity, type QueryValue} from "./endpoints.shared";

export const centralEndpoints = {
  dashboard: {
    overview: "central/dashboard/overview",
    schoolsHealth: "central/dashboard/schools-health",
    systemHealth: "health",
  },
  schools: {
    list: (query: Record<string, QueryValue> = {}) => endpoint("central/schools", query),
    create: "central/schools",
    detail: (id: string) => `central/schools/${entity(id)}`,
    activate: (id: string) => `central/schools/${entity(id)}/activate`,
    deactivate: (id: string) => `central/schools/${entity(id)}/deactivate`,
    admin: (id: string) => `central/schools/${entity(id)}/admin`,
    createAdmin: (id: string) => `central/schools/${entity(id)}/create-admin`,
    resetAdminPassword: (id: string) => `central/schools/${entity(id)}/reset-admin-password`,
  },
  tickets: {
    list: (query: Record<string, QueryValue> = {}) => endpoint("central/tickets", query),
    detail: (id: string) => `central/tickets/${entity(id)}`,
    assign: (id: string) => `central/tickets/${entity(id)}/assign`,
    close: (id: string) => `central/tickets/${entity(id)}/close`,
  },
  audit: (query: Record<string, QueryValue> = {}) => endpoint("central/audit", query),
  policies: "central/policies",
} as const;
