import {redirect} from "next/navigation";

/** The document detail route owns the authorized edit form. */
export default function SchoolDocumentEditAlias({params}: {params: {locale: string; documentId: string}}) {
  redirect(`/${params.locale}/school/correspondence/${params.documentId}`);
}
