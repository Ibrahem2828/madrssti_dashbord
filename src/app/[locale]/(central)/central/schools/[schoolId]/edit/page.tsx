import {redirect} from "next/navigation";

/** The school detail route owns the authorized edit form. */
export default function CentralSchoolEditAlias({params}: {params: {locale: string; schoolId: string}}) {
  redirect(`/${params.locale}/central/schools/${params.schoolId}`);
}
