import {redirect} from "next/navigation";

export default function LegacyAdminReportsPage({params: {locale}}: {params: {locale: string}}) {
  redirect(`/${locale}/school/reports`);
}
