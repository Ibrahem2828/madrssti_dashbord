import {CentralSchoolDetailScreen} from "@/features/central/components/central-screens";

export default function CentralSchoolDetailPage({params}: {params: {schoolId: string}}) {
  return <CentralSchoolDetailScreen schoolId={params.schoolId} />;
}
