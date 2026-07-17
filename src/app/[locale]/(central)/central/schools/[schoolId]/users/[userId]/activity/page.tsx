import {CentralSchoolUserDetailScreen} from "@/features/central/school-users/screens";

export default function CentralSchoolUserActivityPage({params}: {params: {schoolId: string; userId: string}}) {
  return <CentralSchoolUserDetailScreen schoolId={params.schoolId} userId={params.userId} initialTab="activity" />;
}
