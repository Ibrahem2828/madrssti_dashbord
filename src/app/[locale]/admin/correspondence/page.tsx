import {redirect} from "next/navigation";

export default function LegacyAdminCorrespondencePage({params: {locale}}: {params: {locale: string}}) {
  redirect(`/${locale}/school/correspondence`);
}
