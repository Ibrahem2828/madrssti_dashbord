import {CentralSchoolUserCreateScreen} from "@/features/central/school-users/screens";

export default function CentralSchoolUserCreatePage({params}: {params: {schoolId: string}}) {
  return <CentralSchoolUserCreateScreen schoolId={params.schoolId} />;
}
