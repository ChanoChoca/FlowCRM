export const TELEFONO_REGEX = /^\d{10}$/;

export const EMAIL_REGEX = /^[\w.+\-]+@[\w\-]+\.[a-zA-Z]{2,}$/;

const TARJETA_REGEX = /^\d{16}$/;

const NUMERIC_COORD_REGEX = /^-?\d+(\.\d+)?$/;

const AR_LAT_MIN = -90;
const AR_LAT_MAX = -21;
const AR_LNG_MIN = -74;
const AR_LNG_MAX = -25;

function parseArgentinaCoords(
  value: string,
): { lat: number; lng: number } | null {
  const parts = value.trim().split(",");
  if (parts.length !== 2) return null;
  const latRaw = parts[0].trim();
  const lngRaw = parts[1].trim();
  if (!NUMERIC_COORD_REGEX.test(latRaw) || !NUMERIC_COORD_REGEX.test(lngRaw))
    return null;
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (lat < AR_LAT_MIN || lat > AR_LAT_MAX) return null;
  if (lng < AR_LNG_MIN || lng > AR_LNG_MAX) return null;
  return { lat, lng };
}

function get(data: FormData, key: string) {
  return (data.get(key) as string) ?? "";
}

export function validateVenta(
  data: FormData,
  esSupervisor = false,
): VentaErrors {
  const errors: VentaErrors = {};

  if (esSupervisor && !get(data, "asesorId"))
    errors["asesorId"] = "Debe seleccionar un asesor";

  if (!get(data, "promoId")) errors["promoId"] = "La promo es obligatoria";

  if (!get(data, "centralId"))
    errors["centralId"] = "La central es obligatoria";

  if (!get(data, "ani")) errors["ani"] = "El ANI es obligatorio";

  const decos = get(data, "decos");
  const decosNum = Number(decos);
  if (!decos) {
    errors["decos"] = "La cantidad de decos es obligatoria";
  } else if (!Number.isInteger(decosNum)) {
    errors["decos"] = "Debe ser un número entero";
  } else if (decosNum < 0 || decosNum > 1) {
    errors["decos"] = "Debe estar entre 0 y 1";
  }

  if (!get(data, "contacto"))
    errors["contacto"] = "El turno de instalación es obligatorio";

  if (!get(data, "cliente.nombre").trim())
    errors["cliente.nombre"] = "El nombre del cliente es obligatorio";

  if (!get(data, "cliente.numeroDocumento").trim())
    errors["cliente.numeroDocumento"] =
      "El número de documento del cliente es obligatorio";

  const telefono0 = get(data, "telefono_0");
  if (!telefono0.trim()) {
    errors["telefono_0"] = "El teléfono principal es obligatorio";
  } else if (!TELEFONO_REGEX.test(telefono0.trim())) {
    errors["telefono_0"] =
      "El teléfono debe contener exactamente 10 dígitos numéricos";
  }

  const telefono1 = get(data, "telefono_1");
  if (telefono1.trim() && !TELEFONO_REGEX.test(telefono1.trim())) {
    errors["telefono_1"] =
      "El teléfono debe contener exactamente 10 dígitos numéricos";
  }

  const telefono2 = get(data, "telefono_2");
  if (telefono2.trim() && !TELEFONO_REGEX.test(telefono2.trim())) {
    errors["telefono_2"] =
      "El teléfono debe contener exactamente 10 dígitos numéricos";
  }

  const email = get(data, "cliente.email");
  if (!email.trim()) {
    errors["cliente.email"] = "El email del cliente es obligatorio";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors["cliente.email"] = "El email del cliente no tiene un formato válido";
  }

  const fechaNacimiento = get(data, "cliente.fechaNacimiento");
  if (!fechaNacimiento.trim()) {
    errors["cliente.fechaNacimiento"] =
      "La fecha de nacimiento del cliente es obligatoria";
  } else {
    const parsed = new Date(fechaNacimiento);
    if (Number.isNaN(parsed.getTime())) {
      errors["cliente.fechaNacimiento"] =
        "La fecha de nacimiento no tiene un formato válido";
    } else if (parsed.getTime() > Date.now()) {
      errors["cliente.fechaNacimiento"] =
        "La fecha de nacimiento no puede ser futura";
    }
  }

  if (!get(data, "cliente.domicilio.provinciaId"))
    errors["cliente.domicilio.provinciaId"] =
      "La provincia del domicilio del cliente es obligatoria";

  if (!get(data, "cliente.domicilio.calle").trim())
    errors["cliente.domicilio.calle"] =
      "La calle del domicilio del cliente es obligatoria";

  if (!get(data, "cliente.domicilio.numero").trim())
    errors["cliente.domicilio.numero"] =
      "El número del domicilio del cliente es obligatorio";

  if (!get(data, "cliente.domicilio.entreCalles1").trim())
    errors["cliente.domicilio.entreCalles1"] =
      "Entre calles 1 del domicilio del cliente es obligatorio";

  if (!get(data, "cliente.domicilio.entreCalles2").trim())
    errors["cliente.domicilio.entreCalles2"] =
      "Entre calles 2 del domicilio del cliente es obligatorio";

  if (!get(data, "cliente.domicilio.entreCalles3").trim())
    errors["cliente.domicilio.entreCalles3"] =
      "Entre calles 3 del domicilio del cliente es obligatorio";

  if (!get(data, "cliente.domicilio.localidad").trim())
    errors["cliente.domicilio.localidad"] =
      "La localidad del domicilio del cliente es obligatoria";

  if (!get(data, "cliente.domicilio.codigoPostal").trim())
    errors["cliente.domicilio.codigoPostal"] =
      "El código postal del domicilio del cliente es obligatorio";

  if (!get(data, "pago.tipoTarjeta"))
    errors["pago.tipoTarjeta"] = "El tipo de tarjeta es obligatorio";

  if (!get(data, "pago.banco").trim())
    errors["pago.banco"] = "El banco del pago es obligatorio";

  const coordenadas = get(data, "cliente.domicilio.coordenadas");
  if (!coordenadas.trim()) {
    errors["cliente.domicilio.coordenadas"] =
      "Las coordenadas son obligatorias";
  } else if (!parseArgentinaCoords(coordenadas)) {
    errors["cliente.domicilio.coordenadas"] =
      "Coordenadas fuera de Argentina (formato: lat,lng)";
  }

  if (!get(data, "cliente.domicilio.miga").trim())
    errors["cliente.domicilio.miga"] = "Miga es obligatorio";

  const tarjeta = get(data, "pago.numeroTarjeta");
  if (!tarjeta.trim()) {
    errors["pago.numeroTarjeta"] = "El número de tarjeta es obligatorio";
  } else if (!TARJETA_REGEX.test(tarjeta.trim())) {
    errors["pago.numeroTarjeta"] =
      "El número de tarjeta debe contener exactamente 16 dígitos";
  }

  if (!get(data, "pago.titular").trim())
    errors["pago.titular"] = "El titular de la tarjeta es obligatorio";

  return errors;
}

export function validateField(
  name: keyof VentaErrors,
  value: string,
): string | null {
  switch (name) {
    case "asesorId":
      return !value ? "Debe seleccionar un asesor" : null;
    case "promoId":
      return !value ? "La promo es obligatoria" : null;
    case "centralId":
      return !value ? "La central es obligatoria" : null;
    case "ani":
      return !value ? "El ANI es obligatorio" : null;
    case "decos":
      const num = Number(value);
      if (!value) return "La cantidad de decos es obligatoria";
      if (!Number.isInteger(num)) return "Debe ser un número entero";
      if (num < 0 || num > 1) return "Debe estar entre 0 y 1";
      return null;
    case "contacto":
      return !value ? "El turno de instalación es obligatorio" : null;
    case "cliente.nombre":
      return !value.trim() ? "El nombre del cliente es obligatorio" : null;
    case "cliente.numeroDocumento":
      return !value.trim()
        ? "El número de documento del cliente es obligatorio"
        : null;
    case "telefono_0":
      if (!value.trim()) return "El teléfono principal es obligatorio";
      if (!TELEFONO_REGEX.test(value.trim()))
        return "El teléfono debe contener exactamente 10 dígitos numéricos";
      return null;
    case "telefono_1":
    case "telefono_2":
      if (value.trim() && !TELEFONO_REGEX.test(value.trim()))
        return "El teléfono debe contener exactamente 10 dígitos numéricos";
      return null;
    case "cliente.email":
      if (!value.trim()) return "El email del cliente es obligatorio";
      if (!EMAIL_REGEX.test(value.trim()))
        return "El email del cliente no tiene un formato válido";
      return null;
    case "cliente.fechaNacimiento": {
      if (!value.trim())
        return "La fecha de nacimiento del cliente es obligatoria";
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime()))
        return "La fecha de nacimiento no tiene un formato válido";
      if (parsed.getTime() > Date.now())
        return "La fecha de nacimiento no puede ser futura";
      return null;
    }
    case "cliente.domicilio.provinciaId":
      return !value
        ? "La provincia del domicilio del cliente es obligatoria"
        : null;
    case "cliente.domicilio.calle":
      return !value.trim()
        ? "La calle del domicilio del cliente es obligatoria"
        : null;
    case "cliente.domicilio.numero":
      return !value.trim()
        ? "El número del domicilio del cliente es obligatorio"
        : null;
    case "cliente.domicilio.entreCalles1":
      return !value.trim()
        ? "EntreCalles1 del domicilio del cliente es obligatorio"
        : null;
    case "cliente.domicilio.entreCalles2":
      return !value.trim()
        ? "EntreCalles2 del domicilio del cliente es obligatorio"
        : null;
    case "cliente.domicilio.entreCalles3":
      return !value.trim()
        ? "EntreCalles3 del domicilio del cliente es obligatorio"
        : null;
    case "cliente.domicilio.localidad":
      return !value.trim()
        ? "La localidad del domicilio del cliente es obligatoria"
        : null;
    case "cliente.domicilio.codigoPostal":
      return !value.trim()
        ? "El código postal del domicilio del cliente es obligatorio"
        : null;
    case "cliente.domicilio.coordenadas": {
      if (!value.trim()) return "Las coordenadas son obligatorias";
      if (!parseArgentinaCoords(value))
        return "Coordenadas fuera de Argentina (formato: lat,lng)";
      return null;
    }
    case "cliente.domicilio.miga": {
      if (!value.trim()) return "Miga es obligatorio";
      return null;
    }
    case "pago.tipoTarjeta":
      return !value ? "El tipo de tarjeta es obligatorio" : null;
    case "pago.banco":
      return !value.trim() ? "El banco del pago es obligatorio" : null;
    case "pago.numeroTarjeta":
      if (!value.trim()) return "El número de tarjeta es obligatorio";
      if (!TARJETA_REGEX.test(value.trim()))
        return "El número de tarjeta debe contener exactamente 16 dígitos";
      return null;
    case "pago.titular":
      return !value.trim() ? "El titular de la tarjeta es obligatorio" : null;
    default:
      return null;
  }
}

export type VentaErrors = Partial<
  Record<
    | "asesorId"
    | "promoId"
    | "centralId"
    | "ani"
    | "decos"
    | "contacto"
    | "cliente.nombre"
    | "cliente.numeroDocumento"
    | "telefono_0"
    | "telefono_1"
    | "telefono_2"
    | "cliente.email"
    | "cliente.fechaNacimiento"
    | "cliente.domicilio.provinciaId"
    | "cliente.domicilio.calle"
    | "cliente.domicilio.numero"
    | "cliente.domicilio.entreCalles1"
    | "cliente.domicilio.entreCalles2"
    | "cliente.domicilio.entreCalles3"
    | "cliente.domicilio.localidad"
    | "cliente.domicilio.codigoPostal"
    | "cliente.domicilio.coordenadas"
    | "cliente.domicilio.miga"
    | "pago.tipoTarjeta"
    | "pago.banco"
    | "pago.numeroTarjeta"
    | "pago.titular",
    string
  >
>;
