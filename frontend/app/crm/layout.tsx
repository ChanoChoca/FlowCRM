import { getCurrentUser } from "@/app/actions/auth";
import WemeChat from "@/components/WemeChat";
import { CurrentUserProvider } from "@/context/CurrentUserContext";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import CrmShell from "./CrmShell";

export default async function UserLayout({
  children,
}: {
  children: ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/iniciar-sesion?error=sesion_expirada");
  }

  return (
    <div className="relative isolate min-h-screen">
      <CurrentUserProvider user={currentUser}>
        <CrmShell>{children}</CrmShell>
        <WemeChat />
      </CurrentUserProvider>
    </div>
  );
}
