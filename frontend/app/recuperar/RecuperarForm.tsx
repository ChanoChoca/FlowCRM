"use client";

import { useToast } from "@/layout/ToastProvider";
import { AuthService } from "@/lib/auth";
import { useState, useTransition } from "react";

export default function RecuperarForm() {
  const { show } = useToast();

  const [dni, setDni] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await AuthService.forgotPassword(dni);
      show(result.message, result.type);
      if (result.type === "success") setEnviado(true);
    });
  };

  if (enviado) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-7 w-7 text-emerald-600 dark:text-emerald-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v10.875z"
            />
          </svg>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Si el DNI corresponde a un usuario con email registrado, te enviamos
          un correo con un enlace para restablecer tu contraseña. El enlace
          expira en 30 minutos.
        </p>
        <a
          href="/iniciar-sesion"
          className="text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Volver a iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="ml-0.5 text-sm font-bold text-neutral-700 dark:text-neutral-300">
          DNI <span className="text-indigo-600 dark:text-indigo-400">*</span>
        </label>
        <input
          name="dni"
          type="text"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          placeholder="42963177"
          required
          className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:border-indigo-500 dark:focus:bg-neutral-800/80"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="group mt-1 inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-linear-to-br from-indigo-600 to-blue-600 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-lg cursor-pointer"
      >
        {isPending ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="animate-pulse">Enviando...</span>
          </>
        ) : (
          <span>Enviar enlace de recuperación</span>
        )}
      </button>

      <a
        href="/iniciar-sesion"
        className="text-center text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        Volver a iniciar sesión
      </a>
    </form>
  );
}
