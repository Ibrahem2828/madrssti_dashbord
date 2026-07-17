import {CentralSchoolUsersScreen} from "@/features/central/school-users/screens";

export default function CentralSchoolUsersPage({params}: {params: {schoolId: string}}) {
  return <CentralSchoolUsersScreen schoolId={params.schoolId} />;
}
