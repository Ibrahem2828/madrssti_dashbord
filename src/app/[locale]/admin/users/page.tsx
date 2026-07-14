import {redirect} from "next/navigation";

export default function LegacyAdminUsersPage({params: {locale}}: {params: {locale: string}}) {
  redirect(`/${locale}/school/users`);
}
