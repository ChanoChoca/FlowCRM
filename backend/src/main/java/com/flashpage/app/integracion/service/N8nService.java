package com.flashpage.app.integracion.service;

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

import com.flashpage.app.shared.exception.ConflictException;
import com.flashpage.app.shared.exception.ServiceException;
import com.flashpage.app.venta.model.Venta;

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

    public Map<String, Object> sendMessageToN8N(String mensaje, String nombre, String rol) {
        Map<String, Object> body = new HashMap<>();
        body.put("Mensaje", mensaje); body.put("Nombre", nombre); body.put("Rol", rol);
        try {
            return webClient.post().uri(url + "/weme").header("n8n-secret", secret)
                    .contentType(MediaType.APPLICATION_JSON).bodyValue(body).retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, response -> Mono.error(new ConflictException("n8n rechazó el mensaje")))
                    .onStatus(HttpStatusCode::is5xxServerError, response -> Mono.error(new ServiceException("Error interno en n8n")))
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {}).block();
        } catch (ConflictException e) { throw e; }
        catch (Exception e) { log.error("Error enviando mensaje a n8n", e); throw new ServiceException("Error enviando mensaje", e); }
    }

    public List<Map<String, Object>> getChatHistory(String nombre) {
        try {
            return webClient.get().uri(url + "/weme/history?Nombre={nombre}", nombre)
                    .header("n8n-secret", secret).retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, response -> Mono.error(new ConflictException("Historial no encontrado")))
                    .onStatus(HttpStatusCode::is5xxServerError, response -> Mono.error(new ServiceException("Error buscando historial")))
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {}).block();
        } catch (Exception e) { log.error("Error recuperando historial para: {}", nombre, e); return List.of(); }
    }

    public void enviarVenta(Venta venta, String fechaNacimiento, String miga) {
        Map<String, Object> payload = construirPayloadBase(venta, fechaNacimiento, miga);
        payload.put("obsVta", venta.getObservaciones().toUpperCase());
        payload.put("banco", venta.getPago().getBanco().toUpperCase());
        payload.put("nroTarjeta", venta.getPago().getNumeroTarjeta().toUpperCase());
        payload.put("titularTarjeta", venta.getPago().getTitular().toUpperCase());
        String canal = venta.getAsesor().getSupervisor().getPlazaUsername().startsWith("VENTAS") ? "CALL" : "TERR";
        payload.put("canal", canal);
        enviarVentaAN8n("/ventas", payload, venta.getId());
    }

    private void enviarVentaAN8n(String uri, Map<String, Object> payload, Long ventaId) {
        try {
            webClient.post().uri(url + uri).header("n8n-secret", secret)
                    .contentType(MediaType.APPLICATION_JSON).bodyValue(payload).retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, response -> Mono.error(new ConflictException("n8n rechazó la venta")))
                    .onStatus(HttpStatusCode::is5xxServerError, response -> Mono.error(new ServiceException("Error en n8n")))
                    .toBodilessEntity().block();
            log.info("Venta id={} enviada a n8n {}", ventaId, uri);
        } catch (ConflictException e) { throw e; }
        catch (Exception e) { log.error("Error enviando venta id={} a n8n", ventaId, e); throw new ServiceException("Error enviando venta a n8n", e); }
    }

    private Map<String, Object> construirPayloadBase(Venta venta, String fechaNacimiento, String miga) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("id", venta.getId());
        p.put("fechaCarga", venta.getCreadoEn().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        p.put("plazaId", venta.getAsesor().getSupervisor().getPlazaUsername().toUpperCase());
        p.put("supervisor", (venta.getAsesor().getSupervisor().getNombre() + " " + venta.getAsesor().getSupervisor().getApellido()).toUpperCase());
        p.put("asesor", (venta.getAsesor().getNombre() + " " + venta.getAsesor().getApellido()).toUpperCase());
        p.put("nroOrdenYAni", venta.getAni().name());
        p.put("estado", venta.getEstado().name());
        p.put("fechaCumplido", ""); p.put("cluster", ""); p.put("fechaCargaSys", ""); p.put("feedback", "");
        p.put("cliente", venta.getCliente().getNombre().toUpperCase());
        p.put("nroDoc", venta.getCliente().getNumeroDocumento());
        p.put("fechaNac", LocalDate.parse(fechaNacimiento).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        p.put("nroRefe", venta.getCliente().getTelefono());
        p.put("calle", venta.getCliente().getDomicilio().getCalle().toUpperCase());
        p.put("altura", venta.getCliente().getDomicilio().getNumero());
        p.put("piso", venta.getCliente().getDomicilio().getPiso());
        p.put("depto", venta.getCliente().getDomicilio().getDepto());
        p.put("coordenadas", venta.getCliente().getDomicilio().getCoordenadas().toUpperCase());
        p.put("entreCalles", (venta.getCliente().getDomicilio().getEntreCalles1() + " - " + venta.getCliente().getDomicilio().getEntreCalles2() + " - " + venta.getCliente().getDomicilio().getEntreCalles3()).toUpperCase());
        p.put("miga", miga.toUpperCase());
        p.put("localidad", venta.getCliente().getDomicilio().getLocalidad().toUpperCase());
        p.put("codPostal", venta.getCliente().getDomicilio().getCodigoPostal().toUpperCase());
        p.put("promo", venta.getPromo().getNombre().toUpperCase());
        p.put("formaPago", venta.getPago().getTipoTarjeta().name());
        p.put("correo", venta.getCliente().getEmail().toUpperCase());
        return p;
    }
}
