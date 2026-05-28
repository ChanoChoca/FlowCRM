import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("token")?.value;

  const url = new URL("/iniciar-sesion", req.url);
  const reason = new URL(req.url).searchParams.get("reason");
  if (reason) url.searchParams.set("error", reason);

  const response = NextResponse.redirect(url);

  if (jwt) {
    try {
      const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API}/auth/logout`,
        {
          method: "POST",
          headers: { Cookie: `token=${jwt}` },
        },
      );
      const setCookie = backendRes.headers.get("set-cookie");
      if (setCookie) response.headers.set("set-cookie", setCookie);
    } catch {
      // ignore — fall through to local cookie clear
    }
  }

  if (!response.headers.get("set-cookie")) {
    response.cookies.set("token", "", { path: "/", maxAge: 0 });
  }

  return response;
}
