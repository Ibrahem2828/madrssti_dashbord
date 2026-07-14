import {redirect} from "next/navigation";

export default function LegacyAdminRootPage({params: {locale}}: {params: {locale: string}}) {
  redirect(`/${locale}/school`);
}
