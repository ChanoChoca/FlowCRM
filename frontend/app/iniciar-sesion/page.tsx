import { getCurrentUser } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import IniciarSesionForm from "./IniciarSesionForm";

const GOOGLE_ERRORS: Record<string, string> = {
  google_no_vinculado:
    "Tu cuenta de Google no está vinculada a ningún usuario. Iniciá sesión con DNI y contraseña primero.",
  google_cancelado: "Cancelaste el inicio de sesión con Google.",
  sesion_expirada: "Debes iniciar sesión para acceder.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (error !== "sesion_expirada") {
    const currentUser = await getCurrentUser();
    if (currentUser) redirect("/crm");
  }

  const errorMessage = error
    ? (GOOGLE_ERRORS[error] ?? "Ocurrió un error al iniciar sesión.")
    : undefined;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 transition-colors duration-300 bg-neutral-50 dark:bg-neutral-950">
      <div className="pointer-events-none fixed -left-37.5 -top-50 h-125 w-125 rounded-full bg-indigo-500/5 blur-[120px] dark:bg-indigo-500/10" />
      <div className="pointer-events-none fixed -bottom-37.5 -right-25 h-100 w-100 rounded-full bg-blue-500/5 blur-[120px] dark:bg-blue-500/8" />

      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-size-[60px_60px] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]" />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-6">
        <Link
          href="/"
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
          Volver a la página principal
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
              Iniciar Sesión
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              Introducí tu dni y contraseña para acceder al sistema
            </p>
          </div>

          <IniciarSesionForm googleError={errorMessage} />

          <div className="mt-7 border-t border-neutral-100 pt-6 text-center transition-colors dark:border-neutral-800">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              ¿Problemas con tu cuenta?{" "}
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}?subject=Soporte%20t%C3%A9cnico&body=Hola%20equipo%20de%20soporte,%0A%0AEstoy%20teniendo%20problemas%20con%20mi%20cuenta.%20Podrían%20ayudarme%3F%0A%0AGracias!`}
                className="font-bold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Contactá a soporte técnico
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-[0.7rem] font-bold uppercase tracking-widest text-neutral-300 dark:text-neutral-700">
          Junín • Buenos Aires • 2026
        </p>
      </div>
    </main>
  );
}
