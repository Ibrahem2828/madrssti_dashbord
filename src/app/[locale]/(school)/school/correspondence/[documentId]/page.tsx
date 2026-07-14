import {SchoolDocumentDetailScreen} from "@/features/school/components/documents-screen";

export default function SchoolDocumentDetailPage({params}: {params: {documentId: string}}) {
  return <SchoolDocumentDetailScreen documentId={params.documentId} />;
}
