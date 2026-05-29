"use client";

import { crearVenta, VentaActionState } from "@/app/actions/ventas";
import { useOfflineVentas } from "@/hooks/useOfflineVentas";
import { useObservaciones } from "@/hooks/useObservaciones";
import { useToast } from "@/layout/ToastProvider";
import {
  validateField,
  validateVenta,
  VentaErrors,
} from "@/lib/ventas.validation";
import {
  AuditoriaHorario,
  AuditoriaHorarioLabel,
  Ani,
  Origen,
  TipoDocumento,
} from "@/types/enums";
import { useActionState, useEffect, useRef, useState } from "react";

export function useVentaCreation(
  esSupervisor: boolean,
  onSuccess: () => void,
) {
  const { show } = useToast();
  const { isOnline, enqueue } = useOfflineVentas();
  const { updateObs, resetObs, computedObservaciones } = useObservaciones();

  const [errors, setErrors] = useState<VentaErrors>({});
  const [actionState, formAction, isPending] = useActionState<
    VentaActionState,
    FormData
  >(crearVenta, null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!submittedRef.current) return;
    if (isPending) return;
    submittedRef.current = false;
    if (actionState?.error) {
      show(actionState.error, "error");
    } else {
      show("Venta creada exitosamente", "success");
      setErrors({});
      resetObs();
      onSuccess();
    }
  }, [actionState, isPending, show, resetObs, onSuccess]);

  function handleBlur(field: keyof VentaErrors, value: string) {
    const error = validateField(field, value);
    setErrors((prev) => {
      if (!error) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: error };
    });
  }

  function handleChange(field: keyof VentaErrors, value: string) {
    if (!errors[field]) return;
    handleBlur(field, value);
  }

  type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  function blurHandler(field: keyof VentaErrors) {
    return (e: React.FocusEvent<FormElement>) =>
      handleBlur(field, e.target.value);
  }

  function changeHandler(field: keyof VentaErrors) {
    return (e: React.ChangeEvent<FormElement>) =>
      handleChange(field, e.target.value);
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const phoneParts = [
      (form.elements.namedItem("telefono_0") as HTMLInputElement | null)
        ?.value?.trim(),
      (form.elements.namedItem("telefono_1") as HTMLInputElement | null)
        ?.value?.trim(),
      (form.elements.namedItem("telefono_2") as HTMLInputElement | null)
        ?.value?.trim(),
    ].filter(Boolean);
    (form.elements.namedItem("cliente.telefono") as HTMLInputElement).value =
      phoneParts.join(" - ");

    const data = new FormData(form);
    const newErrors = validateVenta(data, esSupervisor);
    if (Object.keys(newErrors).length > 0) {
      e.preventDefault();
      setErrors(newErrors);
      show("Revisá los campos marcados", "error");
      return;
    }

    if (!isOnline) {
      e.preventDefault();
      const contactoRaw = data.get("contacto") as AuditoriaHorario;
      const auditoriaLabel = contactoRaw
        ? AuditoriaHorarioLabel[contactoRaw]
        : "";
      const atencion = (data.get("instalacionTurno") as string) ?? "";
      enqueue({
        promoId: Number(data.get("promoId")),
        centralId: Number(data.get("centralId")),
        ani: data.get("ani") as Ani,
        decos: Number(data.get("decos")),
        contacto: contactoRaw,
        origen: Origen.CRM,
        observaciones: `horario de auditoría: ${auditoriaLabel}\nhorario de atención: ${atencion}`,
        cliente: {
          id: null,
          nombre: (data.get("cliente.nombre") as string) ?? "",
          tipoDocumento: TipoDocumento.DNI,
          numeroDocumento:
            (data.get("cliente.numeroDocumento") as string) ?? "",
          telefono: (data.get("cliente.telefono") as string) ?? "",
          email: (data.get("cliente.email") as string) ?? "",
          domicilio: {
            id: null,
            calle: (data.get("cliente.domicilio.calle") as string) ?? "",
            numero: (data.get("cliente.domicilio.numero") as string) ?? "",
            piso: (data.get("cliente.domicilio.piso") as string) || null,
            depto: (data.get("cliente.domicilio.depto") as string) || null,
            entreCalles1:
              (data.get("cliente.domicilio.entreCalles1") as string) ?? "",
            entreCalles2:
              (data.get("cliente.domicilio.entreCalles2") as string) ?? "",
            entreCalles3:
              (data.get("cliente.domicilio.entreCalles3") as string) ?? "",
            coordenadas:
              (data.get("cliente.domicilio.coordenadas") as string) || null,
            localidad:
              (data.get("cliente.domicilio.localidad") as string) ?? "",
            codigoPostal:
              (data.get("cliente.domicilio.codigoPostal") as string) ?? "",
            provincia: {
              id: Number(data.get("cliente.domicilio.provinciaId")),
              nombre: "",
            },
            observaciones:
              (data.get("cliente.domicilio.observaciones") as string) || null,
          },
        } as any,
        pago: {
          id: 0,
          debitoAutomatico: false,
          tipoTarjeta: (data.get("pago.tipoTarjeta") as any) || null,
          banco: (data.get("pago.banco") as string) ?? "",
          numeroTarjeta: (data.get("pago.numeroTarjeta") as string) ?? "",
          titular: (data.get("pago.titular") as string) ?? "",
        } as any,
        fechaNacimiento:
          (data.get("cliente.fechaNacimiento") as string) || null,
        miga: (data.get("cliente.domicilio.miga") as string) || null,
      });
      show(
        "Sin conexión — venta guardada localmente. Se sincronizará al recuperar la red.",
        "warn",
      );
      setErrors({});
      resetObs();
      onSuccess();
      return;
    }

    submittedRef.current = true;
  }

  function resetErrors() {
    setErrors({});
    resetObs();
  }

  return {
    errors,
    formAction,
    isPending,
    isOnline,
    computedObservaciones,
    updateObs,
    handleSubmit,
    blurHandler,
    changeHandler,
    resetErrors,
  };
}
