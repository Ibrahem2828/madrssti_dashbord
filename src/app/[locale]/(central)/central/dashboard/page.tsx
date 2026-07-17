import {redirect} from "next/navigation";

/** Compatibility route for the Central dashboard root. */
export default function CentralDashboardAlias({params}: {params: {locale: string}}) {
  redirect(`/${params.locale}/central`);
}
