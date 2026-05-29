package com.flashpage.app.catalogo.service;

import java.io.IOException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.SSLException;

import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.cookie.BasicCookieStore;
import org.apache.hc.client5.http.cookie.StandardCookieSpec;
import org.apache.hc.client5.http.entity.UrlEncodedFormEntity;
import org.apache.hc.client5.http.impl.DefaultRedirectStrategy;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.protocol.HttpClientContext;
import org.apache.hc.client5.http.protocol.RedirectLocations;
import org.apache.hc.core5.http.NameValuePair;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.message.BasicHeader;
import org.apache.hc.core5.http.message.BasicNameValuePair;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.flashpage.app.shared.exception.ServiceException;
import com.flashpage.app.shared.exception.ValidationException;
import com.flashpage.app.venta.model.Ani;
import com.flashpage.app.venta.model.AuditoriaHorario;
import com.flashpage.app.venta.model.Cliente;
import com.flashpage.app.venta.model.Domicilio;
import com.flashpage.app.venta.model.Origen;
import com.flashpage.app.venta.model.Pago;
import com.flashpage.app.venta.model.TipoTarjeta;
import com.flashpage.app.venta.model.Venta;

@Service
public class PlazaService {

    private static final Logger log = LoggerFactory.getLogger(PlazaService.class);

    @Value("${external.crm.base-url}")
    private String baseUrl;

    public void enviarVentaAPlazaCazador(Venta venta) {
        enviarVentaAPlaza(venta, "/cazador", true);
    }

    public void enviarVentaAPlazaSupervisor(Venta venta) {
        enviarVentaAPlaza(venta, "/supervisor", false);
    }

    private void enviarVentaAPlaza(Venta venta, String pathPrefix, boolean populateVendedor) {
        validarPrecondiciones(venta);

        BasicCookieStore cookieStore = new BasicCookieStore();
        try (CloseableHttpClient client = createClient(cookieStore)) {
            HttpClientContext context = HttpClientContext.create();
            context.setCookieStore(cookieStore);

            login(client, context, venta, pathPrefix);

            String addUrl = baseUrl + pathPrefix + "/ventas_add.php?page=add&";
            Document addDoc = getPage(client, context, addUrl);
            Map<String, String> form = extractFormValues(addDoc);

            log.debug("ventas_add.php form fields extraídos: {}", form.keySet());
            populateForm(form, venta, addDoc, populateVendedor);

            String postUrl = baseUrl + pathPrefix + "/ventas_add.php?page=add&submit=1&";
            String response = postFormAndGetResponse(client, context, postUrl, form, addUrl);

            if (response.isBlank()) {
                throw new ServiceException("Plaza devolvió una respuesta vacía al enviar la venta");
            }

            Document responseDoc = Jsoup.parse(response);
            RedirectLocations locations = context.getRedirectLocations();

            boolean redirectALogin = locations != null && locations.getAll().stream()
                    .anyMatch(uri -> uri.toString().contains("login.php"));

            Element loginMessage = responseDoc.selectFirst("[data-itemtype='login_message'].alert-danger");
            if (loginMessage != null) {
                throw new ServiceException("Plaza rechazó la venta: sesión expirada o inválida (login denegado)");
            }

            if (redirectALogin) {
                throw new ServiceException("Plaza rechazó la venta: sesión expirada o inválida (redirección a login)");
            }

            Element messageDiv = responseDoc.selectFirst("[data-itemtype='add_message']");
            if (messageDiv == null) {
                throw new ServiceException("Plaza devolvió una respuesta inesperada al enviar la venta");
            }

            String serverMessage = messageDiv.text().trim();
            boolean messageHidden = messageDiv.hasAttr("data-hidden");
            boolean messageSuccess = messageDiv.classNames().contains("alert-success") && !messageHidden;

            boolean errorSesion = serverMessage.contains("sesión ha expirado")
                    || serverMessage.contains("Loginpara guardar")
                    || serverMessage.contains("Login para guardar");

            if (errorSesion) throw new ServiceException("Plaza rechazó la venta: sesión expirada o inválida");
            if (messageSuccess) { log.info("Venta enviada exitosamente a Plaza."); return; }

            List<String> camposRechazados = responseDoc.select("[id^=IsRequired]").stream()
                    .map(el -> el.id().substring("IsRequired".length()))
                    .map(id -> id.replaceAll("_\\d+$", "")).distinct().toList();

            List<String> camposConError = responseDoc.select(".has-error[data-field]").stream()
                    .map(el -> el.attr("data-field")).filter(f -> !f.isBlank()).distinct().toList();

            if (!camposRechazados.isEmpty()) {
                throw new ValidationException(camposRechazados.stream()
                        .map(c -> "Plaza rechazó el campo: " + c).toList());
            }
            if (!camposConError.isEmpty()) {
                throw new ValidationException(camposConError.stream()
                        .map(c -> "Plaza rechazó el campo: " + c).toList());
            }

            throw new ServiceException(serverMessage.isEmpty()
                    ? "Plaza no confirmó la carga de la venta"
                    : "Plaza respondió con error: " + serverMessage);

        } catch (ValidationException | ServiceException e) {
            throw e;
        } catch (SocketTimeoutException e) {
            throw new ServiceException("Plaza no respondió a tiempo. Reintentá en unos minutos.", e);
        } catch (ConnectException | UnknownHostException e) {
            throw new ServiceException("No se pudo conectar con Plaza.", e);
        } catch (SSLException e) {
            throw new ServiceException("Error de seguridad SSL al conectar con Plaza.", e);
        } catch (IOException e) {
            throw new ServiceException("Error de red al comunicarse con Plaza", e);
        } catch (Exception e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
                throw new ServiceException("El envío a Plaza fue interrumpido", e);
            }
            throw new ServiceException("Error al enviar la venta a Plaza", e);
        }
    }

    private void validarPrecondiciones(Venta venta) {
        if (venta.getAsesor() == null) throw new ServiceException("La venta no tiene asesor asignado");
        var supervisor = venta.getAsesor().getSupervisor();
        if (supervisor == null) throw new ServiceException("El asesor no tiene supervisor asignado");
        String usuario = supervisor.getPlazaUsername();
        String password = supervisor.getPlazaPassword();
        if (usuario == null || usuario.isBlank() || password == null || password.isBlank()) {
            throw new ServiceException("El supervisor no tiene credenciales de Plaza configuradas");
        }
        if (venta.getCentral() == null || venta.getCentral().getNombre() == null || venta.getCentral().getNombre().isBlank()) {
            throw new ServiceException("La venta no tiene central asignada");
        }
    }

    private void login(CloseableHttpClient client, HttpClientContext context, Venta venta, String pathPrefix)
            throws IOException {
        String loginUrl = baseUrl + pathPrefix + "/login.php";
        Document loginDoc = getPage(client, context, loginUrl);
        Map<String, String> loginForm = extractFormValues(loginDoc);

        loginForm.put("username", venta.getAsesor().getSupervisor().getPlazaUsername());
        loginForm.put("password", venta.getAsesor().getSupervisor().getPlazaPassword());

        String loginResponse = postFormAndGetResponse(client, context, loginUrl, loginForm, loginUrl);
        Document loginResultDoc = Jsoup.parse(loginResponse);
        Element errorMsg = loginResultDoc.selectFirst("[data-itemtype='login_message'].alert-danger");
        if (errorMsg != null) {
            throw new ServiceException("Login a Plaza fallido: credenciales del supervisor inválidas");
        }

        boolean hasSession = context.getCookieStore().getCookies().stream()
                .anyMatch(c -> "runnerSession".equals(c.getName()) && c.getValue() != null && !c.getValue().isBlank());
        if (!hasSession) throw new ServiceException("Login a Plaza fallido: no se estableció sesión");

        RedirectLocations loginRedirects = context.getRedirectLocations();
        boolean redirectAMenu = loginRedirects != null && loginRedirects.getAll().stream()
                .anyMatch(uri -> uri.toString().endsWith(pathPrefix + "/menu.php"));
        if (!redirectAMenu) throw new ServiceException("Login a Plaza fallido: no se confirmó el ingreso al sistema");
    }

    private void populateForm(Map<String, String> form, Venta venta, Document addDoc, boolean populateVendedor) {
        Element usuarioSelect = addDoc.selectFirst("select[name='value_ID_Usuario_1']");
        if (usuarioSelect == null) throw new ServiceException("No se encontró el campo Usuario en el formulario de Plaza");

        String usuarioValue = usuarioSelect.select("option[value!=]").stream()
                .map(o -> o.val()).filter(v -> !v.isBlank()).findFirst()
                .orElseThrow(() -> new ServiceException("No hay usuarios disponibles en Plaza"));
        form.put("value_ID_Usuario_1", usuarioValue);

        if (populateVendedor) {
            Element vendedorSelect = addDoc.selectFirst("select[name='value_ID_Vendedor_1']");
            if (vendedorSelect != null) {
                vendedorSelect.select("option[value!=]").stream().map(Element::val).filter(v -> !v.isBlank())
                        .findFirst().ifPresent(v -> form.put("value_ID_Vendedor_1", v));
            }
        }

        putIfPresent(form, "value_ANI_1", aniLabel(venta.getAni()));
        form.put("value_Foto_DNI_1", "[]");

        Cliente cliente = venta.getCliente();
        if (cliente != null) {
            putIfPresent(form, "value_Cliente_1", upper(cliente.getNombre()));
            if (cliente.getTipoDocumento() != null) form.put("value_Doc_Tipo_1", cliente.getTipoDocumento().name());
            putIfPresent(form, "value_Doc_Num_1", cliente.getNumeroDocumento());
            putIfPresent(form, "value_E_mail_1", upper(cliente.getEmail()));
            putIfPresent(form, "value_Referencia_1", cliente.getTelefono());

            Domicilio dom = cliente.getDomicilio();
            if (dom != null) {
                putIfPresent(form, "value_Calle_1", upper(dom.getCalle()));
                putIfPresent(form, "value_Numero_1", upper(dom.getNumero()));
                putIfPresent(form, "value_Piso_1", upper(dom.getPiso()));
                putIfPresent(form, "value_Depto_1", upper(dom.getDepto()));
                putIfPresent(form, "value_Entre_Calles_1", upper(dom.getEntreCalles1()));
                putIfPresent(form, "value_Entre_calles_2_1", upper(dom.getEntreCalles2()));
                putIfPresent(form, "value_Entre_calles_3_1", upper(dom.getEntreCalles3()));
                putIfPresent(form, "value_Obs_Dom_1", upper(dom.getObservaciones()));
                putIfPresent(form, "value_Localidad_1", upper(dom.getLocalidad()));
                putIfPresent(form, "value_Cod_Pos_1", upper(dom.getCodigoPostal()));
                if (dom.getProvincia() != null) putIfPresent(form, "value_ID_Provincia_1", dom.getProvincia().getNombre());
            }
        }

        if (venta.getCentral() != null) form.put("value_ID_Central_1", centralCode(venta.getCentral().getNombre()));
        if (venta.getProducto() != null) form.put("value_ID_Producto_1", venta.getProducto().getNombre());
        if (venta.getPromo() != null) form.put("value_ID_Promo_1", venta.getPromo().getNombre());
        form.put("value_DECOS_1", decosValue(venta.getDecos()));

        if (venta.getContacto() != null) {
            String contacto = contactoLabel(venta.getContacto());
            form.put("value_Contacto_1", contacto);
            form.put("radio_Contacto_1", contacto);
        }

        Pago pago = venta.getPago();
        if (pago != null) {
            if (pago.getDebitoAutomatico() != null) {
                String debAuto = boolToSiNo(pago.getDebitoAutomatico());
                form.put("value_Deb_Auto_1", debAuto);
                form.put("radio_Deb_Auto_1", debAuto);
            }
            if (pago.getTipoTarjeta() != null) {
                String tipo = tipoTarjetaLabel(pago.getTipoTarjeta());
                form.put("value_Tipo_Deb_Auto_1", tipo);
                form.put("radio_Tipo_Deb_Auto_1", tipo);
            }
            putIfPresent(form, "value_Banco_1", upper(pago.getBanco()));
            putIfPresent(form, "value_Nro_Tarjeta_1", pago.getNumeroTarjeta());
            putIfPresent(form, "value_Titular_1", upper(pago.getTitular()));
        }

        if (venta.getOrigen() != null) form.put("value_ID_Sistema_1", origenLabel(venta.getOrigen()));

        form.put("id", "1");
        form.put("a", "added");
        form.put("rndVal", String.valueOf(Math.random()));
    }

    private static void putIfPresent(Map<String, String> form, String key, String value) {
        if (value != null && !value.isBlank()) form.put(key, value);
    }

    private static String upper(String s) { return s == null ? null : s.toUpperCase(); }

    private static String centralCode(String nombre) {
        int idx = nombre.indexOf(" -");
        return idx > 0 ? nombre.substring(0, idx).trim() : nombre;
    }

    private static String decosValue(Integer decos) {
        return (decos == null || decos == 0) ? "No" : decos.toString();
    }

    private static String aniLabel(Ani ani) {
        return switch (ani) {
            case VENTA_DIRECTA -> "VENTA DIRECTA";
            case PREVENTA -> "PREVENTA";
            case TICKET -> "TICKET";
        };
    }

    private static String contactoLabel(AuditoriaHorario contacto) {
        return switch (contacto) {
            case AM -> "(AM) DE 08hs A 12hs";
            case PM -> "(PM) DE 12hs A 17hs";
        };
    }

    private static String boolToSiNo(Boolean value) { return Boolean.TRUE.equals(value) ? "Si" : "No"; }

    private static String tipoTarjetaLabel(TipoTarjeta tipo) {
        return switch (tipo) {
            case CREDITO -> "Crédito";
            case DEBITO -> "Débito";
        };
    }

    private static String origenLabel(Origen origen) {
        return switch (origen) {
            case POWER_APP -> "Power_App";
            case CRM, LANDING, META_ADS, GOOGLE_ADS -> "Crm";
        };
    }

    private CloseableHttpClient createClient(BasicCookieStore cookieStore) {
        return HttpClients.custom()
                .setDefaultCookieStore(cookieStore)
                .setDefaultRequestConfig(RequestConfig.custom()
                        .setCookieSpec(StandardCookieSpec.RELAXED)
                        .setConnectionRequestTimeout(10, TimeUnit.SECONDS)
                        .setResponseTimeout(15, TimeUnit.SECONDS)
                        .build())
                .setDefaultHeaders(List.of(
                        new BasicHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"),
                        new BasicHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
                        new BasicHeader("Accept-Language", "es-AR,es;q=0.9"),
                        new BasicHeader("Accept-Encoding", "gzip, deflate, br")))
                .setRedirectStrategy(new DefaultRedirectStrategy())
                .build();
    }

    private Document getPage(CloseableHttpClient client, HttpClientContext context, String url) throws IOException {
        HttpGet get = new HttpGet(url);
        return client.execute(get, context, response -> {
            int code = response.getCode();
            if (code >= 400) throw new ServiceException("GET falló " + code + " en " + url);
            String html = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
            return Jsoup.parse(html, url);
        });
    }

    private static final Set<String> CAMPOS_EXCLUIDOS = Set.of("_action");

    private String postFormAndGetResponse(CloseableHttpClient client, HttpClientContext context,
            String url, Map<String, String> data, String referer) throws IOException {
        List<NameValuePair> params = new ArrayList<>();
        for (Map.Entry<String, String> e : data.entrySet()) {
            if (e.getKey() == null || CAMPOS_EXCLUIDOS.contains(e.getKey())) continue;
            params.add(new BasicNameValuePair(e.getKey(), e.getValue() == null ? "" : e.getValue()));
        }
        HttpPost post = new HttpPost(url);
        post.setHeader("Referer", referer);
        post.setHeader("Origin", baseUrl);
        post.setEntity(new UrlEncodedFormEntity(params, StandardCharsets.UTF_8));
        return client.execute(post, context, response -> {
            int code = response.getCode();
            if (code >= 400) throw new ServiceException("POST falló " + code + " en " + url);
            return response.getEntity() != null
                    ? EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8) : "";
        });
    }

    private Map<String, String> extractFormValues(Document doc) {
        Map<String, String> values = new LinkedHashMap<>();
        for (Element input : doc.select("input[name]")) {
            String type = input.attr("type").toLowerCase(Locale.ROOT);
            if ("submit".equals(type) || "button".equals(type) || "file".equals(type)) continue;
            if (("radio".equals(type) || "checkbox".equals(type)) && !input.hasAttr("checked")) continue;
            values.put(input.attr("name"), input.val());
        }
        for (Element textarea : doc.select("textarea[name]")) values.put(textarea.attr("name"), textarea.val());
        for (Element select : doc.select("select[name]")) {
            Element selected = select.selectFirst("option[selected]");
            values.put(select.attr("name"), selected != null ? selected.val() : select.val());
        }
        return values;
    }
}
