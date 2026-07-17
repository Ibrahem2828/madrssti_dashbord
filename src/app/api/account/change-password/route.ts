import {changeOwnPassword} from "@/features/account/server/account-service";

export async function POST(request: Request) {
  return changeOwnPassword(request);
}
