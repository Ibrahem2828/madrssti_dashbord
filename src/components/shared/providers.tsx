import {AppProviders} from "@/providers/app-providers";

/** @deprecated Compatibility adapter retained for legacy imports. */
export function Providers({children}: {children: React.ReactNode}) {
  return <AppProviders>{children}</AppProviders>;
}
