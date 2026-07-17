import {CentralSchoolUserDetailScreen} from "@/features/central/school-users/screens";

export default function CentralSchoolUserPermissionsPage({params}: {params: {schoolId: string; userId: string}}) {
  return <CentralSchoolUserDetailScreen schoolId={params.schoolId} userId={params.userId} initialTab="permissions" />;
}
