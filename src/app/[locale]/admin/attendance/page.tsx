import {redirect} from "next/navigation";

export default function LegacyAdminAttendancePage({params: {locale}}: {params: {locale: string}}) {
  redirect(`/${locale}/school/attendance`);
}
