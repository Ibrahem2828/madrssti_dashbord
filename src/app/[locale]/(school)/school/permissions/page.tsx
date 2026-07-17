import {redirect} from "next/navigation";

/** Permissions are managed through the authorized School user detail workspace. */
export default function SchoolPermissionsAlias({params}: {params: {locale: string}}) {
  redirect(`/${params.locale}/school/users`);
}
