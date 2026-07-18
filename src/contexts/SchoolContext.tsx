"use client";

/** @deprecated Legacy adapter. New code consumes the sanitized portal session. */
import {createContext, useCallback, useContext, type ReactNode} from "react";

import {requestSchoolSwitch} from "@/lib/auth/school-switch.client";
import {usePortalSession} from "@/providers/auth-provider";

export type ActiveSchool = {
  id: string;
  name: string;
  isPrimary?: boolean;
  status?: string;
};

type LegacySchoolContextValue = {
  activeSchool: ActiveSchool | null;
  availableSchools: ActiveSchool[];
  isLoading: boolean;
  /** Retained as a no-op because the active school is server-authoritative. */
  setActiveSchool: (school: ActiveSchool) => void;
  switchSchool: (schoolId: string) => Promise<{success: boolean; message?: string}>;
  refreshSchools: () => Promise<void>;
};

const LegacySchoolContext = createContext<LegacySchoolContextValue | null>(null);

export function SchoolProvider({children}: {children: ReactNode}) {
  const {session, loading, refreshSession} = usePortalSession();
  const availableSchools = session.schools.map((school) => ({...school, status: "ACTIVE"}));
  const activeSchool = session.activeSchool ? {...session.activeSchool} : null;

  const switchSchool = useCallback(async (schoolId: string) => {
    const success = await requestSchoolSwitch(schoolId);
    if (success) {
      await refreshSession();
    }

    return {success};
  }, [refreshSession]);

  return (
    <LegacySchoolContext.Provider
      value={{
        activeSchool,
        availableSchools,
        isLoading: loading,
        setActiveSchool: () => undefined,
        switchSchool,
        refreshSchools: refreshSession,
      }}
    >
      {children}
    </LegacySchoolContext.Provider>
  );
}

export function useSchool() {
  const value = useContext(LegacySchoolContext);

  if (!value) {
    throw new Error("useSchool must be used within legacy SchoolProvider");
  }

  return value;
}
