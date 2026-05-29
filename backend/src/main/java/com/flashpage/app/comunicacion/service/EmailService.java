package com.flashpage.app.comunicacion.service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.flashpage.app.ticket.model.TicketMensaje;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    @Value("${frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void enviarHtml(String to, String asunto, String html) {
        if (to == null || to.isBlank()) return;
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, false, "UTF-8");
            helper.setFrom(from); helper.setTo(to); helper.setSubject(asunto); helper.setText(html, true);
            mailSender.send(mensaje);
            log.info("Correo enviado a {} con asunto '{}'", to, asunto);
        } catch (MessagingException e) {
            log.error("Error armando MimeMessage para {}: {}", to, e.getMessage());
        } catch (Exception e) {
            log.error("Error enviando correo a {}: {}", to, e.getMessage());
        }
    }

    public void enviarTicketAprobadoADesarrollador(String tituloTicket, String descripcion,
            String creadorNombre, String creadorEmail, String aprobadorNombre, List<TicketMensaje> mensajes) {

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.forLanguageTag("es-AR"))
                .withZone(ZoneId.of("America/Argentina/Buenos_Aires"));

        StringBuilder conv = new StringBuilder();
        if (mensajes == null || mensajes.isEmpty()) {
            conv.append("<p style=\"font-size:13px;color:#737373;font-style:italic\">Sin mensajes adicionales.</p>");
        } else {
            for (TicketMensaje m : mensajes) {
                conv.append("""
                        <div style="margin:0 0 12px 0;padding:10px 12px;border-left:3px solid #e5e5e5;background:#fafafa;border-radius:6px">
                          <p style="margin:0 0 4px 0;font-size:12px;color:#525252;font-weight:600">%s <span style="color:#a3a3a3;font-weight:400">· %s</span></p>
                          <p style="margin:0;font-size:13px;color:#262626;white-space:pre-line">%s</p>
                        </div>
                        """.formatted(safe(m.getAutor().getNombre() + " " + m.getAutor().getApellido()),
                        fmt.format(m.getCreadoEn()), safe(m.getContenido())));
            }
        }

        String emailCreador = (creadorEmail == null || creadorEmail.isBlank())
                ? "<span style=\"color:#a3a3a3\">(sin email)</span>" : safe(creadorEmail);

        String html = """
                <!doctype html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,sans-serif">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:24px 0">
                    <tr><td align="center">
                      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden">
                        <tr><td style="background:#0a0a0a;color:#fff;padding:20px 28px;font-weight:600;font-size:15px">Ticket aprobado · acción requerida</td></tr>
                        <tr><td style="padding:28px">
                          <p style="margin:0 0 16px 0;font-size:14px;color:#525252">%s aprobó el siguiente ticket.</p>
                          <h2 style="margin:0 0 8px 0;font-size:18px;font-weight:600">%s</h2>
                          <p style="margin:0 0 16px 0;font-size:12px;color:#525252">Creador: %s — %s</p>
                          <p style="margin:0 0 20px 0;padding:12px;background:#fafafa;border-radius:8px;font-size:13px;white-space:pre-line">%s</p>
                          %s
                          <a href="%s/crm/soporte" style="display:inline-block;margin-top:8px;background:#0a0a0a;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-size:13px;font-weight:600">Abrir en el CRM</a>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body></html>
                """.formatted(safe(aprobadorNombre), safe(tituloTicket), safe(creadorNombre), emailCreador, safe(descripcion), conv.toString(), frontendUrl);

        enviarHtml(from, "[Ticket aprobado] " + tituloTicket, html);
    }

    public void enviarRecuperacionPassword(String destinatarioEmail, String destinatarioNombre, String token) {
        String url = frontendUrl + "/restablecer?token=" + token;
        String html = layout("Recuperar contraseña", "Hola " + safe(destinatarioNombre) + ",",
                "Recibimos una solicitud para restablecer tu contraseña. El enlace expira en 30 minutos.",
                "Restablecer tu contraseña", "Si no solicitaste este cambio, podés ignorar este correo.",
                "Restablecer contraseña", url);
        enviarHtml(destinatarioEmail, "Recuperar contraseña - FlowCRM", html);
    }

    public void enviarAnuncio(String destinatarioEmail, String destinatarioNombre, String autorNombre,
            String titulo, String contenido) {
        String html = layout("Nuevo comunicado", "Hola " + safe(destinatarioNombre) + ",",
                autorNombre + " publicó un nuevo comunicado:", titulo, contenido, "Ver comunicado",
                frontendUrl + "/crm/anuncios");
        enviarHtml(destinatarioEmail, "Comunicado: " + titulo, html);
    }

    private String layout(String header, String saludo, String intro, String titulo, String cuerpo, String ctaLabel, String ctaUrl) {
        return """
                <!doctype html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,sans-serif">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:24px 0">
                    <tr><td align="center">
                      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden">
                        <tr><td style="background:#0a0a0a;color:#fff;padding:20px 28px;font-weight:600;font-size:15px">%s</td></tr>
                        <tr><td style="padding:28px">
                          <p style="margin:0 0 12px 0;font-size:14px;color:#525252">%s</p>
                          <p style="margin:0 0 20px 0;font-size:14px;color:#525252">%s</p>
                          <h2 style="margin:0 0 12px 0;font-size:18px;font-weight:600">%s</h2>
                          <p style="margin:0 0 24px 0;font-size:14px;line-height:1.55;color:#404040;white-space:pre-line">%s</p>
                          <a href="%s" style="display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-size:13px;font-weight:600">%s</a>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body></html>
                """.formatted(safe(header), safe(saludo), safe(intro), safe(titulo), safe(cuerpo), ctaUrl, safe(ctaLabel));
    }

    private String safe(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
