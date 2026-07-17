import {PortalShell} from "@/components/layout/portal-shell";
import {schoolNavigation} from "@/config/navigation.school";
import {SchoolPortalGate} from "@/features/school/components/school-portal-gate";

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <PortalShell portal="school" navigation={schoolNavigation}>
      <SchoolPortalGate>{children}</SchoolPortalGate>
    </PortalShell>
  );
}
