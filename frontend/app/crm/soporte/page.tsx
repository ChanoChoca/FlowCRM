import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getTickets } from "@/app/actions/tickets";
import Soporte from "./Soporte";
import Loading from "./loading";

async function SoporteContent() {
  const tickets = await getTickets();
  return <Soporte tickets={tickets} />;
}

export default async function Page() {
  const jar = await cookies();
  if (!jar.get("token")?.value) redirect("/iniciar-sesion");

  return (
    <Suspense fallback={<Loading />}>
      <SoporteContent />
    </Suspense>
  );
}
