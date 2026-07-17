import {redirect} from "next/navigation";

/** Compatibility route for the School dashboard root. */
export default function SchoolDashboardAlias({params}: {params: {locale: string}}) {
  redirect(`/${params.locale}/school`);
}
