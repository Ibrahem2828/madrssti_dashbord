import type {Portal} from "@/config/routes";
export type PortalSession = {authenticated: boolean; portal: Portal | null; user: {id: string; email: string; fullName: string; userType: string} | null; activeSchool: {id: string; name: string} | null; schools: Array<{id: string; name: string; isPrimary: boolean}>; roles: string[]; permissions: string[]};
export const emptySession: PortalSession = {authenticated: false, portal: null, user: null, activeSchool: null, schools: [], roles: [], permissions: []};
