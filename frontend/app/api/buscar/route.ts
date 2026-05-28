import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Rol } from "@/types/enums";
import { parseRol } from "@/lib/mappers/rol";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ ventas: [], usuarios: [] });
  }

  const base = process.env.NEXT_PUBLIC_API;
  const authHeaders = { Authorization: `Bearer ${token}` };

  let currentUser: { id: number; rol: Rol } | null = null;
  try {
    const meRes = await fetch(`${base}/auth/me`, {
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    });
    if (meRes.ok) {
      const meData = await meRes.json();
      const rol = parseRol(meData.rol);
      if (rol != null && meData.id != null) {
        currentUser = { id: meData.id, rol };
      }
    }
  } catch {}

  const ventasParams = new URLSearchParams({
    cliente: q,
    size: "5",
    page: "0",
  });
  const usuariosParams = new URLSearchParams({
    q,
    size: "5",
    page: "0",
  });

  let skipUsuarios = false;

  if (currentUser) {
    if (currentUser.rol === Rol.ASESOR) {
      ventasParams.set("asesorId", String(currentUser.id));
      skipUsuarios = true;
    } else if (currentUser.rol === Rol.SUPERVISOR) {
      ventasParams.set("supervisorId", String(currentUser.id));
      usuariosParams.set("supervisorId", String(currentUser.id));
    } else if (currentUser.rol === Rol.JEFE_DE_SUPERVISOR) {
      ventasParams.set("jefeDeSupervisorId", String(currentUser.id));
      usuariosParams.set("supervisorId", String(currentUser.id));
    }
  }

  const fetches: Promise<Response>[] = [
    fetch(`${base}/ventas?${ventasParams.toString()}`, {
      headers: authHeaders,
      cache: "no-store",
    }),
  ];

  if (!skipUsuarios) {
    fetches.push(
      fetch(`${base}/usuarios?${usuariosParams.toString()}`, {
        headers: authHeaders,
        cache: "no-store",
      }),
    );
  }

  const responses = await Promise.all(fetches);

  const ventas = responses[0].ok
    ? (await responses[0].json()).content ?? []
    : [];
  const usuarios =
    !skipUsuarios && responses[1]?.ok
      ? (await responses[1].json()).content ?? []
      : [];

  return NextResponse.json({ ventas, usuarios });
}