import {getOwnProfile, updateOwnProfile} from "@/features/account/server/account-service";

export async function GET() {
  return getOwnProfile();
}

export async function PATCH(request: Request) {
  return updateOwnProfile(request);
}
