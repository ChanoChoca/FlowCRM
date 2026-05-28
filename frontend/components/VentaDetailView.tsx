import DetailField from "@/components/DetailField";
import { VentaDetalleResponse } from "@/types/dtos";

export default function VentaDetailView({
  detail,
  currentPage,
  currentSize,
  onClose,
}: {
  detail: VentaDetalleResponse;
  currentPage: number;
  currentSize: number;
  onClose: () => void;
}) {
  return (
    <section className="flex flex-col gap-6 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight dark:text-neutral-100">
            Venta #{detail.id}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {detail.cliente.nombre}
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
        <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Datos de la venta
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailField label="Producto" value={detail.productoNombre} />
          <DetailField label="Promo" value={detail.promoNombre} />
          <DetailField label="Central" value={detail.centralNombre} />
          <DetailField label="ANI" value={detail.ani} />
          <DetailField label="Decos" value={String(detail.decos)} />
          <DetailField label="Turno de instalacion" value={detail.contacto} />
          <DetailField label="Origen" value={detail.origen ?? "-"} />
          {detail.observaciones && (
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Observaciones
              </div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100 whitespace-pre-line">
                {detail.observaciones}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
        <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Asesor
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailField
            label="Nombre"
            value={`${detail.asesor.apellido}, ${detail.asesor.nombre}`}
          />
          <DetailField label="DNI" value={detail.asesor.dni} />
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
        <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Cliente
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailField label="Nombre" value={detail.cliente.nombre} />
          <DetailField
            label="Tipo documento"
            value={detail.cliente.tipoDocumento}
          />
          <DetailField
            label="Numero documento"
            value={detail.cliente.numeroDocumento}
          />
          <DetailField label="Telefono" value={detail.cliente.telefono} />
          <DetailField label="Email" value={detail.cliente.email} />
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
        <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Domicilio del cliente
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailField label="Calle" value={detail.cliente.domicilio.calle} />
          <DetailField label="Numero" value={detail.cliente.domicilio.numero} />
          <DetailField
            label="Piso"
            value={detail.cliente.domicilio.piso ?? "-"}
          />
          <DetailField
            label="Depto"
            value={detail.cliente.domicilio.depto ?? "-"}
          />
          <DetailField
            label="Entre calles 1"
            value={detail.cliente.domicilio.entreCalles1}
          />
          <DetailField
            label="Entre calles 2"
            value={detail.cliente.domicilio.entreCalles2}
          />
          <DetailField
            label="Entre calles 3"
            value={detail.cliente.domicilio.entreCalles3}
          />
          <DetailField
            label="Localidad"
            value={detail.cliente.domicilio.localidad}
          />
          <DetailField
            label="Codigo postal"
            value={detail.cliente.domicilio.codigoPostal}
          />
          {detail.cliente.domicilio.provincia && (
            <DetailField
              label="Provincia"
              value={detail.cliente.domicilio.provincia.nombre}
            />
          )}
          {detail.cliente.domicilio.observaciones && (
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Observaciones
              </div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100 whitespace-pre-line">
                {detail.cliente.domicilio.observaciones}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
        <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Pago
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailField
            label="Debito automatico"
            value={detail.pago.debitoAutomatico ? "Si" : "No"}
          />
          <DetailField
            label="Tipo tarjeta"
            value={detail.pago.tipoTarjeta ?? "-"}
          />
          <DetailField label="Banco" value={detail.pago.banco} />
          <DetailField
            label="Numero tarjeta"
            value={detail.pago.numeroTarjeta}
          />
          <DetailField label="Titular" value={detail.pago.titular} />
        </div>
      </div>
    </section>
  );
}
