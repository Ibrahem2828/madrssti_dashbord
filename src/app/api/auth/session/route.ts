import {NextResponse} from "next/server";

import {buildFailureResponse} from "@/lib/api/backend";
import {getSessionResult} from "@/lib/auth/session";

export async function GET() {
  const result = await getSessionResult();

  if (!result.ok) {
    return buildFailureResponse(result.status, result.code, result.message, {requestId: result.requestId});
  }

  return NextResponse.json(result.session, {headers: {"Cache-Control": "no-store"}});
}
