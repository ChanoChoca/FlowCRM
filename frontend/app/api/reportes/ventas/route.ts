import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 });
  }

  const search = req.nextUrl.searchParams.toString();
  const url = `${process.env.NEXT_PUBLIC_API}/reportes/ventas${search ? "?" + search : ""}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { mensaje: "Error al generar el reporte" },
      { status: res.status },
    );
  }

  const buffer = await res.arrayBuffer();
  const contentDisposition =
    res.headers.get("Content-Disposition") ??
    'attachment; filename="ventas.xlsx"';

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": contentDisposition,
    },
  });
}
