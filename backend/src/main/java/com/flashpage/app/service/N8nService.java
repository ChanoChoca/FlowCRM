package com.flashpage.app.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.flashpage.app.exception.ConflictException;
import com.flashpage.app.exception.ServiceException;
import com.flashpage.app.model.Venta;

import reactor.core.publisher.Mono;

@Service
public class N8nService {

    private static final Logger log = LoggerFactory.getLogger(N8nService.class);

    @Value("${n8n.url}")
    private String url;

    @Value("${n8n.secret}")
    private String secret;

    private final WebClient webClient;

    public N8nService(WebClient webClient) {
        this.webClient = webClient;
    }

    // --- 1. ENVIAR MENSAJE ---
    public Map<String, Object> sendMessageToN8N(String mensaje, String nombre, String rol) {

        Map<String, Object> body = new HashMap<>();
        body.put("Mensaje", mensaje);
        body.put("Nombre", nombre);
        body.put("Rol", rol);

        try {
            return webClient.post()
                    .uri(url + "/weme")
                    .header("n8n-secret", secret)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError,
                            response -> Mono.error(new ConflictException("n8n rechazó el mensaje")))
                    .onStatus(HttpStatusCode::is5xxServerError,
                            response -> Mono.error(new ServiceException("Error interno en n8n")))
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                    })
                    .block();
        } catch (ConflictException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error enviando mensaje a n8n", e);
            throw new ServiceException("Error enviando mensaje", e);
        }
    }

    // --- 2. RECUPERAR HISTORIAL ---
    public List<Map<String, Object>> getChatHistory(String nombre) {
        try {
            return webClient.get()
                    // Usamos la URL directa y dejamos que Spring inyecte el {nombre}
                    // automáticamente
                    .uri(url + "/weme/history?Nombre={nombre}", nombre)
                    .header("n8n-secret", secret)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError,
                            response -> Mono.error(new ConflictException("Historial no encontrado")))
                    .onStatus(HttpStatusCode::is5xxServerError,
                            response -> Mono.error(new ServiceException("Error buscando historial")))
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                    })
                    .block();
        } catch (Exception e) {
            log.error("Error recuperando historial para: {}", nombre, e);
            return List.of();
        }
    }

    // --- 3. ENVIAR VENTA ---
    public void enviarVenta(Venta venta, String fechaNacimiento, String miga) {
        Map<String, Object> payload = construirPayloadBase(venta, fechaNacimiento, miga);

        payload.put("obsVta", venta.getObservaciones().toUpperCase());
        payload.put("banco", venta.getPago().getBanco().toUpperCase());
        payload.put("nroTarjeta", venta.getPago().getNumeroTarjeta().toUpperCase());
        payload.put("titularTarjeta", venta.getPago().getTitular().toUpperCase());

        String canal = venta.getAsesor().getSupervisor().getPlazaUsername().startsWith("VENTAS")
                ? "CALL"
                : "TERR";
        payload.put("canal", canal.toUpperCase());

        enviarVentaAN8n("/ventas", payload, venta.getId());
    }

    private void enviarVentaAN8n(String uri, Map<String, Object> payload, Long ventaId) {
        log.info("Enviando venta id={} a n8n {}", ventaId, uri);
        try {
            webClient.post()
                    .uri(url + uri)
                    .header("n8n-secret", secret)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError,
                            response -> Mono.error(new ConflictException("n8n rechazó la venta")))
                    .onStatus(HttpStatusCode::is5xxServerError,
                            response -> Mono.error(new ServiceException("Error en n8n")))
                    .toBodilessEntity()
                    .block();

            log.info("Venta id={} enviada a n8n {}", ventaId, uri);
        } catch (ConflictException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error enviando venta id={} a n8n {}: {}", ventaId, uri, e.getMessage(), e);
            throw new ServiceException("Error enviando venta a n8n", e);
        }
    }

    private Map<String, Object> construirPayloadBase(Venta venta, String fechaNacimiento, String miga) {
        Map<String, Object> payload = new LinkedHashMap<>();

        payload.put("id", venta.getId());
        payload.put("fechaCarga", venta.getCreadoEn().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        payload.put("plazaId", venta.getAsesor().getSupervisor().getPlazaUsername().toUpperCase());
        payload.put("supervisor",
                (venta.getAsesor().getSupervisor().getNombre() + " " + venta.getAsesor().getSupervisor().getApellido())
                        .toUpperCase());
        payload.put("asesor",
                (venta.getAsesor().getNombre() + " " + venta.getAsesor().getApellido()).toUpperCase());
        payload.put("nroOrdenYAni", venta.getAni().name()); // falta nroOrden
        payload.put("estado", venta.getEstado().name());
        payload.put("fechaCumplido", "");
        payload.put("cluster", "");
        payload.put("fechaCargaSys", "");
        payload.put("feedback", "");
        payload.put("cliente", venta.getCliente().getNombre().toUpperCase());
        payload.put("nroDoc", venta.getCliente().getNumeroDocumento());
        payload.put("fechaNac", LocalDate.parse(fechaNacimiento).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        payload.put("nroRefe", venta.getCliente().getTelefono());
        payload.put("calle", venta.getCliente().getDomicilio().getCalle().toUpperCase());
        payload.put("altura", venta.getCliente().getDomicilio().getNumero());
        payload.put("piso", venta.getCliente().getDomicilio().getPiso());
        payload.put("depto", venta.getCliente().getDomicilio().getDepto());
        payload.put("coordenadas", venta.getCliente().getDomicilio().getCoordenadas().toUpperCase());
        payload.put("entreCalles",
                (venta.getCliente().getDomicilio().getEntreCalles1() + " - "
                        + venta.getCliente().getDomicilio().getEntreCalles2() + " - "
                        + venta.getCliente().getDomicilio().getEntreCalles3()).toUpperCase());
        payload.put("miga", miga.toUpperCase());
        payload.put("localidad", venta.getCliente().getDomicilio().getLocalidad().toUpperCase());
        payload.put("codPostal", venta.getCliente().getDomicilio().getCodigoPostal().toUpperCase());
        payload.put("promo", venta.getPromo().getNombre().toUpperCase());
        payload.put("formaPago", venta.getPago().getTipoTarjeta().name());
        payload.put("correo", venta.getCliente().getEmail().toUpperCase());

        return payload;
    }
}