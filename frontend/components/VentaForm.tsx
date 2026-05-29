"use client";

import { CatalogosResponse } from "@/app/actions/catalogo";
import Field from "@/components/Field";
import Modal from "@/components/Modal";
import SelectField from "@/components/SelectField";
import TextAreaField from "@/components/TextAreaField";
import { useVentaCreation } from "@/hooks/useVentaCreation";
import { enumToOptions } from "@/lib/option";
import { VentaErrors } from "@/lib/ventas.validation";
import { UsuarioSupervisorResponse } from "@/types/dtos";
import {
  Ani,
  AuditoriaHorario,
  AuditoriaHorarioLabel,
  InstalacionTurno,
  TipoTarjeta,
} from "@/types/enums";
import { useMemo } from "react";

interface Props {
  open: boolean;
  esSupervisor: boolean;
  misAsesores: UsuarioSupervisorResponse[];
  catalogos: CatalogosResponse;
  currentPage: number;
  currentSize: number;
  onClose: () => void;
}

export default function VentaForm({
  open,
  esSupervisor,
  misAsesores,
  catalogos,
  currentPage,
  currentSize,
  onClose,
}: Props) {
  const {
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
  } = useVentaCreation(esSupervisor, onClose);

  const emptyCreateKey = useMemo(
    () => `venta-create-${currentPage}-${currentSize}`,
    [currentPage, currentSize],
  );

  function handleClose() {
    resetErrors();
    onClose();
  }

  return (
    <Modal open={open} title="Crear venta" onClose={handleClose}>
      <form
        action={formAction}
        key={emptyCreateKey}
        onSubmit={handleSubmit}
        className="grid gap-4 sm:gap-6"
      >
        <section className="grid gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3 sm:p-4 dark:border-neutral-700/50 dark:bg-neutral-800/30">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
            Datos de la venta
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {esSupervisor && (
              <SelectField
                className="sm:col-span-2"
                label="Asesor"
                name="asesorId"
                options={misAsesores.map((a) => ({
                  value: a.id!,
                  label: `${a.nombre} ${a.apellido}`,
                }))}
                required
                error={errors["asesorId"]}
                onBlur={blurHandler("asesorId")}
                onChange={changeHandler("asesorId")}
              />
            )}
            <SelectField
              label="Promo"
              name="promoId"
              options={catalogos.promos.map((p) => ({ value: p.id, label: p.nombre }))}
              required
              error={errors["promoId"]}
              onBlur={blurHandler("promoId")}
              onChange={changeHandler("promoId")}
            />
            <SelectField
              label="Central"
              name="centralId"
              options={catalogos.centrales.map((c) => ({ value: c.id, label: c.nombre }))}
              required
              error={errors["centralId"]}
              onBlur={blurHandler("centralId")}
              onChange={(e) => {
                changeHandler("centralId")(e);
                const central = catalogos.centrales.find(
                  (c) => String(c.id) === e.target.value,
                );
                updateObs("centralNombre", central?.nombre ?? "");
              }}
            />
            <SelectField
              label="ANI"
              name="ani"
              options={enumToOptions(Ani)}
              required
              error={errors["ani"]}
              onBlur={blurHandler("ani")}
              onChange={changeHandler("ani")}
            />
            <Field
              label="Decos"
              name="decos"
              type="number"
              min={0}
              max={3}
              step={1}
              required
              error={errors["decos"]}
              onBlur={blurHandler("decos")}
              onChange={changeHandler("decos")}
            />
            <SelectField
              label="Horario de auditoría"
              name="contacto"
              options={Object.values(AuditoriaHorario).map((v) => ({
                value: v,
                label: AuditoriaHorarioLabel[v],
              }))}
              required
              error={errors["contacto"]}
              onBlur={blurHandler("contacto")}
              onChange={changeHandler("contacto")}
            />
            <SelectField
              label="Horario de instalación"
              name="instalacionTurno"
              options={enumToOptions(InstalacionTurno)}
              required
              onChange={(e) => updateObs("instalacionTurno", e.target.value)}
            />
          </div>
        </section>

        <section className="grid gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3 sm:p-4 dark:border-neutral-700/50 dark:bg-neutral-800/30">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
            Cliente
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nombre"
              name="cliente.nombre"
              required
              error={errors["cliente.nombre"]}
              onBlur={blurHandler("cliente.nombre")}
              onChange={changeHandler("cliente.nombre")}
            />
            <Field
              label="Numero documento"
              name="cliente.numeroDocumento"
              required
              error={errors["cliente.numeroDocumento"]}
              onBlur={blurHandler("cliente.numeroDocumento")}
              onChange={changeHandler("cliente.numeroDocumento")}
            />
            <Field
              label="Teléfono 1"
              name="telefono_0"
              required
              error={errors["telefono_0"]}
              onBlur={blurHandler("telefono_0")}
              onChange={changeHandler("telefono_0")}
            />
            <Field
              label="Teléfono 2 (opcional)"
              name="telefono_1"
              error={errors["telefono_1"]}
              onBlur={blurHandler("telefono_1")}
              onChange={changeHandler("telefono_1")}
            />
            <Field
              label="Teléfono 3 (opcional)"
              name="telefono_2"
              error={errors["telefono_2"]}
              onBlur={blurHandler("telefono_2")}
              onChange={changeHandler("telefono_2")}
            />
            <input type="hidden" name="cliente.telefono" />
            <Field
              label="Fecha de nacimiento"
              name="cliente.fechaNacimiento"
              type="date"
              required
              error={errors["cliente.fechaNacimiento"]}
              onBlur={blurHandler("cliente.fechaNacimiento")}
              onChange={(e) => {
                changeHandler("cliente.fechaNacimiento")(e);
                updateObs("fechaNacimiento", e.target.value);
              }}
            />
            <Field
              label="Email"
              name="cliente.email"
              type="email"
              required
              error={errors["cliente.email"]}
              onBlur={blurHandler("cliente.email")}
              onChange={changeHandler("cliente.email")}
            />
            <SelectField
              label="Provincia"
              name="cliente.domicilio.provinciaId"
              options={catalogos.provincias.map((p) => ({ value: p.id, label: p.nombre }))}
              required
              error={errors["cliente.domicilio.provinciaId"]}
              onBlur={blurHandler("cliente.domicilio.provinciaId")}
              onChange={changeHandler("cliente.domicilio.provinciaId")}
            />
            <Field
              label="Calle"
              name="cliente.domicilio.calle"
              required
              error={errors["cliente.domicilio.calle"]}
              onBlur={blurHandler("cliente.domicilio.calle")}
              onChange={(e) => {
                changeHandler("cliente.domicilio.calle")(e);
                updateObs("calle", e.target.value);
              }}
            />
            <Field
              label="Numero"
              name="cliente.domicilio.numero"
              required
              error={errors["cliente.domicilio.numero"]}
              onBlur={blurHandler("cliente.domicilio.numero")}
              onChange={changeHandler("cliente.domicilio.numero")}
            />
            <Field label="Piso" name="cliente.domicilio.piso" />
            <Field label="Depto" name="cliente.domicilio.depto" />
            <Field
              label="Entre calles 1"
              name="cliente.domicilio.entreCalles1"
              required
              error={errors["cliente.domicilio.entreCalles1"]}
              onBlur={blurHandler("cliente.domicilio.entreCalles1")}
              onChange={changeHandler("cliente.domicilio.entreCalles1")}
            />
            <Field
              label="Entre calles 2"
              name="cliente.domicilio.entreCalles2"
              required
              error={errors["cliente.domicilio.entreCalles2"]}
              onBlur={blurHandler("cliente.domicilio.entreCalles2")}
              onChange={changeHandler("cliente.domicilio.entreCalles2")}
            />
            <Field
              label="Entre calles 3"
              name="cliente.domicilio.entreCalles3"
              required
              error={errors["cliente.domicilio.entreCalles3"]}
              onBlur={blurHandler("cliente.domicilio.entreCalles3")}
              onChange={changeHandler("cliente.domicilio.entreCalles3")}
            />
            <Field
              label="Localidad"
              name="cliente.domicilio.localidad"
              required
              error={errors["cliente.domicilio.localidad"]}
              onBlur={blurHandler("cliente.domicilio.localidad")}
              onChange={(e) => {
                changeHandler("cliente.domicilio.localidad")(e);
                updateObs("localidad", e.target.value);
              }}
            />
            <Field
              label="Codigo postal"
              name="cliente.domicilio.codigoPostal"
              required
              error={errors["cliente.domicilio.codigoPostal"]}
              onBlur={blurHandler("cliente.domicilio.codigoPostal")}
              onChange={changeHandler("cliente.domicilio.codigoPostal")}
            />
            <Field
              label="Coordenadas"
              name="cliente.domicilio.coordenadas"
              type="text"
              required
              inputMode="decimal"
              error={errors["cliente.domicilio.coordenadas"]}
              onBlur={blurHandler("cliente.domicilio.coordenadas")}
              onChange={(e) => {
                changeHandler("cliente.domicilio.coordenadas")(e);
                updateObs("coordenadas", e.target.value);
              }}
            />
            <TextAreaField
              className="sm:col-span-2"
              label="Miga"
              name="cliente.domicilio.miga"
              required
              onChange={(e) => {
                changeHandler("cliente.domicilio.miga")(e);
                updateObs("miga", e.target.value);
              }}
            />
          </div>
        </section>

        <section className="grid gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3 sm:p-4 dark:border-neutral-700/50 dark:bg-neutral-800/30">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
            Observaciones del domicilio
          </h3>
          {computedObservaciones.trim() && (
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Vista previa
              </p>
              <pre className="rounded-lg bg-neutral-100 px-3 py-2 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 overflow-x-auto whitespace-pre-wrap wrap-break-word">
                {computedObservaciones}
              </pre>
            </div>
          )}
          <input
            type="hidden"
            name="cliente.domicilio.observaciones"
            value={computedObservaciones}
          />
        </section>

        <section className="grid gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-700/50 dark:bg-neutral-800/30">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
            Pago
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Tipo tarjeta"
              name="pago.tipoTarjeta"
              options={enumToOptions(TipoTarjeta)}
              required
              error={errors["pago.tipoTarjeta"]}
              onBlur={blurHandler("pago.tipoTarjeta")}
              onChange={changeHandler("pago.tipoTarjeta")}
            />
            <Field
              label="Banco"
              name="pago.banco"
              required
              error={errors["pago.banco"]}
              onBlur={blurHandler("pago.banco")}
              onChange={changeHandler("pago.banco")}
            />
            <Field
              label="Numero tarjeta"
              name="pago.numeroTarjeta"
              required
              error={errors["pago.numeroTarjeta"]}
              onBlur={blurHandler("pago.numeroTarjeta")}
              onChange={changeHandler("pago.numeroTarjeta")}
            />
            <Field
              label="Titular"
              name="pago.titular"
              required
              error={errors["pago.titular"]}
              onBlur={blurHandler("pago.titular")}
              onChange={changeHandler("pago.titular")}
            />
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 ${
              isOnline
                ? "bg-linear-to-br from-indigo-600 to-blue-600 shadow-indigo-500/20 hover:shadow-indigo-500/30"
                : "bg-linear-to-br from-amber-500 to-orange-500 shadow-amber-500/20 hover:shadow-amber-500/30"
            }`}
          >
            {isPending
              ? "Guardando…"
              : isOnline
                ? "Guardar venta"
                : "Guardar offline"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
