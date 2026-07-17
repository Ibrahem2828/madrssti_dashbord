import {redirect} from "next/navigation";

/** The current school catalogue contains the authorized create-school form. */
export default function CentralSchoolCreateAlias({params}: {params: {locale: string}}) {
  redirect(`/${params.locale}/central/schools`);
}
