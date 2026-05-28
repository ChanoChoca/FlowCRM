import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import RestablecerForm from "./RestablecerForm";

export default async function RestablecerPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("token")?.value;
  if (sessionToken) redirect("/crm");

  const { token } = await searchParams;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 transition-colors duration-300 bg-neutral-50 dark:bg-neutral-950">
      <div className="pointer-events-none fixed -left-37.5 -top-50 h-125 w-125 rounded-full bg-indigo-500/5 blur-[120px] dark:bg-indigo-500/10" />
      <div className="pointer-events-none fixed -bottom-37.5 -right-25 h-100 w-100 rounded-full bg-blue-500/5 blur-[120px] dark:bg-blue-500/8" />

      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-size-[60px_60px] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]" />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-6">
        <Link
          href="/iniciar-sesion"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-neutral-400 transition-colors hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio de sesión
        </Link>

        <div className="w-full rounded-2xl border border-neutral-200/80 bg-white/90 p-8 shadow-xl shadow-neutral-200/40 backdrop-blur-xl transition-colors duration-300 dark:border-neutral-700/50 dark:bg-neutral-900/80 dark:shadow-none">
          <div className="mb-8 text-center">
            <div className="mb-5 justify-self-center">
              <Image
                src="/images/logo/logo.svg"
                alt="FlowCRM Logo"
                width={2000}
                height={419}
                priority
                className="h-8 w-auto dark:hidden"
              />
              <Image
                src="/images/logo/logo.svg"
                alt="FlowCRM Logo"
                width={2000}
                height={419}
                priority
                className="hidden h-8 w-auto dark:block"
              />
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
              Restablecer contraseña
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              {token
                ? "Ingresá tu nueva contraseña"
                : "Enlace inválido o incompleto"}
            </p>
          </div>

          {token ? (
            <RestablecerForm token={token} />
          ) : (
            <div className="flex flex-col gap-4 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                El enlace que utilizaste no es válido. Solicitá uno nuevo desde
                la página de recuperación.
              </p>
              <a
                href="/recuperar"
                className="text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Solicitar nuevo enlace
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-[0.7rem] font-bold uppercase tracking-widest text-neutral-300 dark:text-neutral-700">
          Junín • Buenos Aires • 2026
        </p>
      </div>
    </main>
  );
}
