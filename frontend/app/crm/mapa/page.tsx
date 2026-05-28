import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { obtenerVentasMapa } from "@/app/actions/mapa";
import MapaView from "./MapaView";
import Loading from "./loading";

async function MapaContent({ desde, hasta }: { desde: string; hasta: string }) {
  const points = await obtenerVentasMapa(desde, hasta).catch(() => []);
  return <MapaView points={points} desde={desde} hasta={hasta} />;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/iniciar-sesion");

  const hoy = new Date();
  const hasta = params?.hasta ?? hoy.toISOString().slice(0, 10);
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const desde = params?.desde ?? primerDiaMes.toISOString().slice(0, 10);

  return (
    <Suspense fallback={<Loading />}>
      <MapaContent desde={desde} hasta={hasta} />
    </Suspense>
  );
}
