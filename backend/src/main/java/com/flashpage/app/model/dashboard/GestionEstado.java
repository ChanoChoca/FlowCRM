package com.flashpage.app.model.dashboard;

/**
 * Estados del ciclo de vida de una Gestión (contacto/lead).
 *
 * Flujo típico:
 *   PENDIENTE → CONTACTADO → INTERESADO → VENDIDO
 *                          ↘ NO_INTERESADO
 *                          ↘ NO_CONTESTA (reintento)
 *                          ↘ NUMERO_INVALIDO
 */
public enum GestionEstado {
 
    /** Asignada al asesor, aún no se intentó contacto */
    PENDIENTE,
 
    /** Se realizó al menos un intento de contacto */
    CONTACTADO,
 
    /** El prospecto mostró interés, negociación en curso */
    INTERESADO,
 
    /** Cerrado con éxito — tiene una Venta asociada */
    VENDIDO,
 
    /** Contactado, pero explícitamente rechazó */
    NO_INTERESADO,
 
    /** Intentos realizados sin respuesta */
    NO_CONTESTA,
 
    /** El número de teléfono es incorrecto o está fuera de servicio */
    NUMERO_INVALIDO
}