import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getAnuncios } from "@/app/actions/anuncios";
import Anuncios from "./Anuncios";
import Loading from "./loading";

async function AnunciosContent() {
  const anuncios = await getAnuncios();
  return <Anuncios anuncios={anuncios} />;
}

export default async function Page() {
  const jar = await cookies();
  if (!jar.get("token")?.value) redirect("/iniciar-sesion");

  return (
    <Suspense fallback={<Loading />}>
      <AnunciosContent />
    </Suspense>
  );
}
