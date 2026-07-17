import {redirect} from "next/navigation";

/** Roles are managed through the authorized School user detail workspace. */
export default function SchoolRolesAlias({params}: {params: {locale: string}}) {
  redirect(`/${params.locale}/school/users`);
}
