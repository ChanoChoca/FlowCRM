"use client";

import { useToast } from "@/layout/ToastProvider";
import { AuthService } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function RestablecerForm({ token }: { token: string }) {
  const { show } = useToast();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 8) {
      show("La contraseña debe tener al menos 8 caracteres", "error");
      return;
    }

    if (password !== confirm) {
      show("Las contraseñas no coinciden", "error");
      return;
    }

    startTransition(async () => {
      const result = await AuthService.resetPassword(token, password);
      show(result.message, result.type);
      if (result.type === "success") router.replace("/iniciar-sesion");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="ml-0.5 text-sm font-bold text-neutral-700 dark:text-neutral-300">
          Nueva contraseña{" "}
          <span className="text-indigo-600 dark:text-indigo-400">*</span>
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 pr-12 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:border-indigo-500 dark:focus:bg-neutral-800/80"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 cursor-pointer"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="ml-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Mínimo 8 caracteres
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="ml-0.5 text-sm font-bold text-neutral-700 dark:text-neutral-300">
          Confirmar contraseña{" "}
          <span className="text-indigo-600 dark:text-indigo-400">*</span>
        </label>
        <input
          name="confirm"
          type={showPassword ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
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
            <span className="animate-pulse">Guardando...</span>
          </>
        ) : (
          <span>Restablecer contraseña</span>
        )}
      </button>
    </form>
  );
}
