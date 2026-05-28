"use client";

import { desvincularGoogle } from "@/app/actions/auth";
import {
  actualizarUsuario,
  crearUsuario,
  UsuarioActionState,
} from "@/app/actions/usuarios";
import Field from "@/components/Field";
import { useToast } from "@/layout/ToastProvider";
import { parseRol, rolLabel, rolOptions } from "@/lib/mappers/rol";
import {
  UsuarioDetalleResponse,
  UsuarioSupervisorResponse,
} from "@/types/dtos";
import { Rol } from "@/types/enums";
import { Provincia } from "@/types/models";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

type Props = (
  | { mode: "create" }
  | { mode: "edit"; id: string; usuario: UsuarioDetalleResponse }
) & {
  currentUserRol?: Rol;
  supervisores: UsuarioSupervisorResponse[];
  jefesDeSupervisor: UsuarioSupervisorResponse[];
  provincias: Provincia[];
  canChangePassword?: boolean;
  returnPage: number;
  returnSize: number;
  onCancel?: () => void;
};

type FieldErrors = Partial<
  Record<
    | "dni"
    | "password"
    | "nombre"
    | "apellido"
    | "telefono"
    | "rol"
    | "supervisorId",
    string
  >
>;

const EMAIL_REGEX = /^[\w.+\-]+@[\w\-]+\.[a-zA-Z]{2,}$/;
const DNI_REGEX = /^\d{7,8}$/;
const TELEFONO_REGEX = /^\d{10}$/;

function validateTelefono(value: string): string | null {
  if (!value.trim()) return "El teléfono es obligatorio";
  if (!TELEFONO_REGEX.test(value.trim()))
    return "El teléfono debe contener exactamente 10 dígitos numéricos";
  return null;
}

function validateDni(value: string): string | null {
  if (!value.trim()) return "El DNI es obligatorio";
  if (!DNI_REGEX.test(value.trim()))
    return "El DNI debe contener entre 7 y 8 dígitos numéricos";
  return null;
}

function validatePassword(value: string): string | null {
  if (!value) return "La contraseña es obligatoria";
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  return null;
}

function validateNombre(value: string, mode: "create" | "edit"): string | null {
  if (mode === "create" && !value.trim()) return "El nombre es obligatorio";
  if (mode === "edit" && !value.trim()) return "El nombre no puede estar vacío";
  return null;
}

function validateApellido(
  value: string,
  mode: "create" | "edit",
): string | null {
  if (mode === "create" && !value.trim()) return "El apellido es obligatorio";
  if (mode === "edit" && !value.trim())
    return "El apellido no puede estar vacío";
  return null;
}

function validateRol(value: string, mode: "create" | "edit"): string | null {
  if (mode === "create" && !value) return "El rol es obligatorio";
  return null;
}

function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} es obligatorio`;
  return null;
}

function validateAll(
  data: FormData,
  mode: "create" | "edit",
  puedeAsignarSupervisor: boolean,
): FieldErrors {
  const errors: FieldErrors = {};

  const get = (key: string) => (data.get(key) as string) ?? "";

  const dniError = validateDni(get("dni"));
  if (dniError) errors["dni"] = dniError;

  if (mode === "create") {
    const pwdError = validatePassword(get("password"));
    if (pwdError) errors["password"] = pwdError;
  } else {
    const pwd = get("password");
    if (pwd && pwd.length > 0 && pwd.length < 8) {
      errors["password"] = "La contraseña debe tener al menos 8 caracteres";
    }
  }

  const nombreError = validateNombre(get("nombre"), mode);
  if (nombreError) errors["nombre"] = nombreError;

  const apellidoError = validateApellido(get("apellido"), mode);
  if (apellidoError) errors["apellido"] = apellidoError;

  const telefonoError = validateTelefono(get("telefono"));
  if (telefonoError) errors["telefono"] = telefonoError;

  const rolError = validateRol(get("rol"), mode);
  if (rolError) errors["rol"] = rolError;

  if (puedeAsignarSupervisor) {
    const rolValue = get("rol");
    const supervisorIdValue = get("supervisorId");
    if (rolValue === String(Rol.ASESOR) && !supervisorIdValue) {
      errors["supervisorId"] = "Debe seleccionar un supervisor para el asesor";
    }
    if (rolValue === String(Rol.SUPERVISOR) && !supervisorIdValue) {
      errors["supervisorId"] =
        "Debe seleccionar un jefe de supervisor para el supervisor";
    }
  }

  return errors;
}

export default function UsuarioForm(props: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const { mode, currentUserRol, supervisores, jefesDeSupervisor, provincias } =
    props;
  const { show } = useToast();

  const router = useRouter();
  const searchParams = useSearchParams();

  const usuario = mode === "edit" ? props.usuario : undefined;
  const id = mode === "edit" ? props.id : undefined;

  const [googleVinculado, setGoogleVinculado] = useState(
    mode === "edit" ? (props.usuario.googleVinculado ?? false) : false,
  );
  const [googleEmail, setGoogleEmail] = useState(
    mode === "edit" ? (props.usuario.email ?? null) : null,
  );
  const [isUnlinking, startUnlinkTransition] = useTransition();

  useEffect(() => {
    if (searchParams.get("googleVinculado") === "true") {
      show("Cuenta de Google vinculada correctamente", "success");
    }
    if (searchParams.get("error") === "google_link_error") {
      show("No se pudo vincular la cuenta de Google", "error");
    }
    if (searchParams.get("error") === "google_cancelado") {
      show("Cancelaste el inicio de sesión con Google", "error");
    }
  }, [searchParams, show]);

  function handleDesvincular() {
    startUnlinkTransition(async () => {
      const result = await desvincularGoogle();
      if (result.error) {
        show(result.error, "error");
      } else {
        setGoogleVinculado(false);
        setGoogleEmail(null);
        show("Cuenta de Google desvinculada", "success");
      }
    });
  }

  const action = mode === "edit" ? actualizarUsuario : crearUsuario;
  const [actionState, formAction, isPending] = useActionState<
    UsuarioActionState,
    FormData
  >(action, null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted || isPending) return;

    if (actionState?.error) {
      show(actionState.error, "error");
      setSubmitted(false);
      return;
    }

    show(
      mode === "edit"
        ? "Usuario actualizado correctamente"
        : "Usuario creado correctamente",
      "success",
    );
    setSubmitted(false);
    router.push(
      `/crm/usuarios?page=${props.returnPage}&size=${props.returnSize}`,
    );
  }, [
    actionState,
    isPending,
    submitted,
    show,
    mode,
    router,
    props.returnPage,
    props.returnSize,
  ]);

  const initialRol = mode === "edit" ? props.usuario.rol : undefined;
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | undefined>(
    initialRol,
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const rolesDisponibles = useMemo(
    () => rolOptions(currentUserRol),
    [currentUserRol],
  );

  const puedeGestionarRol =
    currentUserRol === Rol.LIDER ||
    currentUserRol === Rol.GERENTE ||
    currentUserRol === Rol.ADMINISTRACION_RRHH_COBRANZA ||
    currentUserRol === Rol.JEFE_DE_SUPERVISOR ||
    currentUserRol === Rol.SUPERVISOR;

  const puedeGestionarPlaza =
    currentUserRol === Rol.LIDER ||
    currentUserRol === Rol.ADMINISTRACION_RRHH_COBRANZA;

  const puedeAsignarSupervisor =
    currentUserRol === Rol.LIDER ||
    currentUserRol === Rol.GERENTE ||
    currentUserRol === Rol.ADMINISTRACION_RRHH_COBRANZA ||
    currentUserRol === Rol.JEFE_DE_SUPERVISOR;

  const mostrarSupervisor =
    puedeAsignarSupervisor && rolSeleccionado === Rol.ASESOR;

  const mostrarJefeDeSupervisor =
    puedeAsignarSupervisor && rolSeleccionado === Rol.SUPERVISOR;

  const mostrarPlaza =
    puedeGestionarPlaza && rolSeleccionado === Rol.SUPERVISOR;

  const cancelHref = "/crm/usuarios";

  function handleBlur(field: keyof FieldErrors, value: string) {
    let error: string | null = null;

    switch (field) {
      case "dni":
        error = validateDni(value);
        break;
      case "password":
        if (mode === "create") {
          error = validatePassword(value);
        } else if (value.length > 0 && value.length < 8) {
          error = "La contraseña debe tener al menos 8 caracteres";
        }
        break;
      case "nombre":
        error = validateNombre(value, mode);
        break;
      case "apellido":
        error = validateApellido(value, mode);
        break;
      case "telefono":
        error = validateTelefono(value);
        break;
    }

    setErrors((prev) => {
      if (!error) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: error };
    });
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget);
    const newErrors = validateAll(data, mode, puedeAsignarSupervisor);

    if (Object.keys(newErrors).length > 0) {
      e.preventDefault();
      setErrors(newErrors);
      show("Revisá los campos marcados", "error");
      return;
    }

    setSubmitted(true);
  }

  function blurHandler(field: keyof FieldErrors) {
    return (e: React.FocusEvent<HTMLInputElement>) =>
      handleBlur(field, e.target.value);
  }

  function changeHandler(field: keyof FieldErrors) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      if (errors[field]) handleBlur(field, e.target.value);
    };
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight dark:text-neutral-100">
            {mode === "edit" ? "Editar usuario" : "Crear usuario"}
          </h1>
          {usuario && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {usuario.apellido}, {usuario.nombre}
            </p>
          )}
        </div>

        {props.onCancel ? (
          <button
            type="button"
            onClick={props.onCancel}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Cerrar
          </button>
        ) : (
          <Link
            href={cancelHref}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {mode === "edit" ? "Volver al detalle" : "Volver"}
          </Link>
        )}
      </div>

      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60"
      >
        {mode === "edit" && <input type="hidden" name="id" value={id} />}

        <input type="hidden" name="returnPage" value={props.returnPage} />
        <input type="hidden" name="returnSize" value={props.returnSize} />

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="DNI"
            name="dni"
            defaultValue={usuario?.dni}
            required
            error={errors["dni"]}
            onBlur={blurHandler("dni")}
            onChange={changeHandler("dni")}
          />
          {(mode === "create" ||
            (mode === "edit" && props.canChangePassword)) && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {mode === "edit" ? "Nueva contraseña" : "Contraseña"}
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required={mode === "create"}
                  placeholder={
                    mode === "edit" ? "Dejar vacío para no cambiar" : ""
                  }
                  onBlur={blurHandler("password")}
                  onChange={changeHandler("password")}
                  className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 pr-10 text-neutral-900 outline-none transition-colors duration-200 placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-neutral-100 disabled:text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:border-indigo-500 dark:disabled:bg-neutral-800 ${errors["password"] ? "border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 cursor-pointer"
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
              {errors["password"] && (
                <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">
                  {errors["password"]}
                </p>
              )}
            </div>
          )}
          <Field
            label="Nombre"
            name="nombre"
            defaultValue={usuario?.nombre}
            required
            error={errors["nombre"]}
            onBlur={blurHandler("nombre")}
            onChange={changeHandler("nombre")}
          />
          <Field
            label="Apellido"
            name="apellido"
            defaultValue={usuario?.apellido}
            required
            error={errors["apellido"]}
            onBlur={blurHandler("apellido")}
            onChange={changeHandler("apellido")}
          />
          <Field
            label="Teléfono"
            name="telefono"
            required
            defaultValue={usuario?.telefono ?? ""}
            error={errors["telefono"]}
            onBlur={blurHandler("telefono")}
            onChange={changeHandler("telefono")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {puedeGestionarRol && rolesDisponibles.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Rol
              </label>
              <select
                name="rol"
                defaultValue={usuario?.rol ?? ""}
                className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 dark:focus:border-indigo-500 ${errors["rol"] ? "border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-500" : ""}`}
                onChange={(e) => {
                  setRolSeleccionado(
                    e.target.value === ""
                      ? undefined
                      : parseRol(Number(e.target.value)),
                  );
                  if (errors["rol"]) {
                    const error = validateRol(e.target.value, mode);
                    setErrors((prev) => {
                      if (!error) {
                        const next = { ...prev };
                        delete next["rol"];
                        return next;
                      }
                      return { ...prev, rol: error };
                    });
                  }
                }}
                onBlur={(e) => {
                  const error = validateRol(e.target.value, mode);
                  setErrors((prev) => {
                    if (!error) {
                      const next = { ...prev };
                      delete next["rol"];
                      return next;
                    }
                    return { ...prev, rol: error };
                  });
                }}
              >
                <option value="">Sin rol</option>
                {rolesDisponibles.map((r) => (
                  <option key={r} value={r}>
                    {rolLabel(r)}
                  </option>
                ))}
              </select>
              {errors["rol"] && (
                <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">
                  {errors["rol"]}
                </p>
              )}
            </div>
          )}

          {mostrarSupervisor && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Supervisor <span className="text-red-500">*</span>
              </label>
              <select
                name="supervisorId"
                required
                defaultValue={
                  usuario?.supervisorId ? String(usuario.supervisorId) : ""
                }
                onChange={() => {
                  if (errors["supervisorId"]) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next["supervisorId"];
                      return next;
                    });
                  }
                }}
                className={`w-full rounded-xl border bg-white px-3 py-2 text-neutral-900 outline-none transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 dark:focus:border-indigo-500 ${errors["supervisorId"] ? "border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-500" : "border-neutral-300"}`}
              >
                <option value="">Seleccionar supervisor</option>
                {supervisores.map((s) => (
                  <option key={s.id ?? undefined} value={s.id ?? undefined}>
                    {s.apellido}, {s.nombre}
                  </option>
                ))}
              </select>
              {errors["supervisorId"] && (
                <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">
                  {errors["supervisorId"]}
                </p>
              )}
            </div>
          )}

          {mostrarJefeDeSupervisor && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Jefe de Supervisor <span className="text-red-500">*</span>
              </label>
              <select
                name="supervisorId"
                required
                defaultValue={
                  usuario?.supervisorId ? String(usuario.supervisorId) : ""
                }
                onChange={() => {
                  if (errors["supervisorId"]) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next["supervisorId"];
                      return next;
                    });
                  }
                }}
                className={`w-full rounded-xl border bg-white px-3 py-2 text-neutral-900 outline-none transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 dark:focus:border-indigo-500 ${errors["supervisorId"] ? "border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-500" : "border-neutral-300"}`}
              >
                <option value="">Seleccionar jefe de supervisor</option>
                {jefesDeSupervisor.map((s) => (
                  <option key={s.id ?? undefined} value={s.id ?? undefined}>
                    {s.apellido}, {s.nombre}
                  </option>
                ))}
              </select>
              {errors["supervisorId"] && (
                <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">
                  {errors["supervisorId"]}
                </p>
              )}
            </div>
          )}
        </div>

        {mostrarPlaza && (
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-700/50 dark:bg-neutral-800/30">
            <h2 className="mb-3 text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Plaza
            </h2>
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-700/50 dark:bg-amber-900/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Por favor verificá que los datos de plaza sean correctos. Si no lo son, los asesores a cargo de este supervisor no podrán cargar ventas.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="Plaza username"
                name="plazaUsername"
                defaultValue={usuario?.plazaUsername ?? ""}
              />
              <Field
                label="Plaza password"
                name="plazaPassword"
                defaultValue={usuario?.plazaPassword ?? ""}
              />
            </div>
          </div>
        )}

        {mode === "edit" && (
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-700/50 dark:bg-neutral-800/30">
            <h2 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Cuenta de Google
            </h2>
            {googleVinculado ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {googleEmail ?? "Cuenta vinculada"}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Vinculada
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API}/auth/google/link`}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    Cambiar cuenta
                  </a>
                  <button
                    type="button"
                    onClick={handleDesvincular}
                    disabled={isUnlinking}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-950/30 cursor-pointer"
                  >
                    {isUnlinking ? "Desvinculando..." : "Desvincular"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No hay ninguna cuenta de Google vinculada.
                </p>
                <a
                  href={`${process.env.NEXT_PUBLIC_API}/auth/google/link`}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Vincular con Google
                </a>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {props.onCancel ? (
            <button
              type="button"
              onClick={props.onCancel}
              className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Cancelar
            </button>
          ) : (
            <Link
              href={cancelHref}
              className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancelar
            </Link>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-linear-to-br from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isPending
              ? mode === "edit"
                ? "Guardando..."
                : "Creando..."
              : mode === "edit"
                ? "Guardar cambios"
                : "Crear usuario"}
          </button>
        </div>
      </form>
    </section>
  );
}
