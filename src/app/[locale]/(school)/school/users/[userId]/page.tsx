import {SchoolUserDetailScreen} from "@/features/school/components/users-screen";

export default function SchoolUserDetailPage({params}: {params: {userId: string}}) {
  return <SchoolUserDetailScreen userId={params.userId} />;
}
