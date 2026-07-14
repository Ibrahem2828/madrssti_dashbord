import {CentralTicketDetailScreen} from "@/features/central/components/central-screens";

export default function CentralTicketDetailPage({params}: {params: {ticketId: string}}) {
  return <CentralTicketDetailScreen ticketId={params.ticketId} />;
}
