import {NextResponse} from "next/server";

import {issueCsrfToken} from "@/lib/auth/csrf";

export async function GET() {
  const requestId = crypto.randomUUID();

  return NextResponse.json(
    {
      success: true,
      data: {
        csrfToken: issueCsrfToken(),
      },
      requestId,
    },
    {
      headers: {
        "X-Request-ID": requestId,
      },
    },
  );
}
