"use server";

export async function enviarFormulario(_prev: unknown, formData: FormData) {
  const nombreCompleto = String(formData.get("nombreCompleto") || "").trim();
  const telefono = String(formData.get("telefono") || "").trim();
  const servicioDeseado = String(formData.get("servicio") || "");

  const n8nBody = { nombreCompleto, telefono, servicioDeseado };
  const crmBody = {
    nombreCompleto,
    telefono,
    servicioDeseado,
    origen: "LANDING",
  };

  const apiBase = process.env.NEXT_PUBLIC_API ?? "http://localhost:8080/api";

  const automationWebhook = process.env.AUTOMATION_WEBHOOK_URL ?? "";

  const [n8nRes, crmRes] = await Promise.allSettled([
    fetch(automationWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n8nBody),
      cache: "no-store",
    }),
    fetch(`${apiBase}/leads/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(crmBody),
      cache: "no-store",
    }),
  ]);

  const n8nOk = n8nRes.status === "fulfilled" && n8nRes.value.ok;
  const crmOk = crmRes.status === "fulfilled" && crmRes.value.ok;

  if (!n8nOk && !crmOk) {
    return {
      message: "Error al enviar el formulario. Intentá de nuevo.",
      type: "error" as const,
    };
  }

  return {
    message: "Formulario enviado correctamente",
    type: "success" as const,
  };
}
