package com.flashpage.app.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.cookie.BasicCookieStore;
import org.apache.hc.client5.http.entity.UrlEncodedFormEntity;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.protocol.HttpClientContext;
import org.apache.hc.core5.http.NameValuePair;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.message.BasicNameValuePair;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.exception.ServiceException;
import com.flashpage.app.model.Central;
import com.flashpage.app.model.Producto;
import com.flashpage.app.model.Promo;
import com.flashpage.app.model.Provincia;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.repository.CentralRepository;
import com.flashpage.app.repository.ProductoRepository;
import com.flashpage.app.repository.PromoRepository;
import com.flashpage.app.repository.ProvinciaRepository;
import com.flashpage.app.repository.UsuarioRepository;

@Service
@Transactional
public class PlazaCatalogSyncService {

    private static final Logger log = LoggerFactory.getLogger(PlazaCatalogSyncService.class);

    @Value("${external.crm.base-url}")
    private String externalCrmBaseUrl;

    private final ProductoRepository productoRepository;
    private final PromoRepository promoRepository;
    private final ProvinciaRepository provinciaRepository;
    private final CentralRepository centralRepository;
    private final UsuarioRepository usuarioRepository;

    public PlazaCatalogSyncService(ProductoRepository productoRepository,
            PromoRepository promoRepository,
            ProvinciaRepository provinciaRepository,
            CentralRepository centralRepository,
            UsuarioRepository usuarioRepository) {
        this.productoRepository = productoRepository;
        this.promoRepository = promoRepository;
        this.provinciaRepository = provinciaRepository;
        this.centralRepository = centralRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @org.springframework.context.event.EventListener(ApplicationReadyEvent.class)
    public void ejecutarSincronizacionInicial() {
        log.info("Iniciando sincronización manual al arranque de la aplicación...");
        try {
            sincronizarCatalogos();
        } catch (Exception e) {
            log.error("La sincronización inicial falló, pero la app seguirá corriendo. Error: {}", e.getMessage(), e);
        }
    }

    @Scheduled(cron = "${plaza.catalogos.cron}", zone = "America/Argentina/Buenos_Aires")
    public void sincronizarCatalogos() {
        Usuario cazUser = usuarioRepository.findFirstByPlazaUsernameStartingWithIgnoreCaseAndActivoTrue("CAZ")
                .orElseThrow(() -> new ServiceException(
                        "No se encontró un usuario activo con plazaUsername iniciando en 'CAZ'"));

        try (CloseableHttpClient client = createClient()) {
            HttpClientContext context = HttpClientContext.create();
            context.setCookieStore(new BasicCookieStore());

            Document loginDoc = getPage(client, context, externalCrmBaseUrl + "/cazador/login.php");
            Map<String, String> loginForm = extractFormValues(loginDoc);

            loginForm.put("username", cazUser.getPlazaUsername());
            loginForm.put("password", cazUser.getPlazaPassword());
            loginForm.put("submitLogin1", "Aceptar");

            postForm(client, context, externalCrmBaseUrl + "/cazador/login.php", loginForm);

            Document addDoc = getPage(client, context, externalCrmBaseUrl + "/cazador/ventas_add.php");

            syncProductos(addDoc);
            syncPromos(addDoc);
            syncProvincias(addDoc);
            syncCentrales(addDoc);

            log.info("Catálogos sincronizados desde Plaza");

        } catch (Exception e) {
            log.error("Error sincronizando catálogos desde Plaza", e);
            throw new ServiceException("No se pudieron sincronizar los catálogos desde Plaza", e);
        }
    }

    private void syncProductos(Document doc) {
        syncSelectOptions(
                doc,
                "select[name=value_ID_Producto_1] option",
                productoRepository,
                Producto::new,
                Producto::getNombre,
                Producto::setNombre);
    }

    private static final List<String> PROMOS_EXCLUIDAS = List.of("MOVIL", "100MB", "500MB", "PACK", "COMBO");

    private boolean esPromoExcluida(String nombre) {
        if (nombre == null)
            return false;
        String upper = nombre.toUpperCase(Locale.ROOT);
        return PROMOS_EXCLUIDAS.stream().anyMatch(upper::contains);
    }

    private void syncPromos(Document doc) {
        Set<String> plazaNombres = doc.select("select[name=value_ID_Promo_1] option").stream()
                .map(e -> e.text() != null ? e.text().trim() : "")
                .filter(this::esNombreValido)
                .filter(n -> !esPromoExcluida(n))
                .collect(Collectors.toSet());

        Map<String, String> plazaNormalizados = plazaNombres.stream()
                .collect(Collectors.toMap(this::normalizarNombre, n -> n, (a, b) -> a));

        List<Promo> existentes = promoRepository.findAll();
        Map<String, Promo> dbMap = existentes.stream()
                .filter(p -> p.getNombre() != null && !p.getNombre().isBlank())
                .collect(Collectors.toMap(
                        p -> normalizarNombre(p.getNombre()),
                        p -> p,
                        (a, b) -> a));

        for (Map.Entry<String, String> entry : plazaNormalizados.entrySet()) {
            if (!dbMap.containsKey(entry.getKey())) {
                Promo promo = new Promo();
                promo.setNombre(entry.getValue());
                promoRepository.save(promo);
            }
        }

        for (Promo promo : existentes) {
            String nombre = promo.getNombre();
            if (nombre == null)
                continue;
            boolean excluida = esPromoExcluida(nombre);
            boolean ausenteEnPlaza = !plazaNormalizados.containsKey(normalizarNombre(nombre));
            if ((excluida || ausenteEnPlaza) && promo.isActivo()) {
                promo.setActivo(false);
            }
        }
    }

    private void syncProvincias(Document doc) {
        syncSelectOptions(
                doc,
                "select[name=value_ID_Provincia_1] option",
                provinciaRepository,
                Provincia::new,
                Provincia::getNombre,
                Provincia::setNombre);
    }

    private void syncCentrales(Document doc) {
        syncSelectOptions(
                doc,
                "select[name=value_ID_Central_1] option",
                centralRepository,
                Central::new,
                Central::getNombre,
                Central::setNombre);
    }

    private <T> void syncSelectOptions(
            Document doc,
            String selector,
            JpaRepository<T, Long> repository,
            Supplier<T> creator,
            Function<T, String> nombreGetter,
            BiConsumer<T, String> nombreSetter) {

        Set<String> plazaNombres = doc.select(selector).stream()
                .map(e -> e.text() != null ? e.text().trim() : "")
                .filter(this::esNombreValido)
                .map(this::normalizarNombre)
                .collect(Collectors.toSet());

        List<T> existentes = repository.findAll();

        Map<String, T> dbMap = existentes.stream()
                .map(e -> Map.entry(normalizarNombreSeguro(nombreGetter.apply(e)), e))
                .filter(entry -> !entry.getKey().isBlank())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (a, b) -> a));

        for (String nombreNormalizado : plazaNombres) {
            if (!dbMap.containsKey(nombreNormalizado)) {
                T entidad = creator.get();
                nombreSetter.accept(entidad, nombreNormalizadoOriginal(doc, selector, nombreNormalizado));
                repository.save(entidad);
            }
        }

        for (T entity : existentes) {
            String nombre = nombreGetter.apply(entity);
            if (nombre == null)
                continue;

            if (!plazaNombres.contains(normalizarNombre(nombre))) {
                repository.delete(entity);
            }
        }
    }

    private boolean esNombreValido(String nombre) {
        return nombre != null
                && !nombre.isBlank()
                && !nombre.equalsIgnoreCase("Por favor seleccione");
    }

    private String normalizarNombre(String nombre) {
        return nombre == null ? "" : nombre.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizarNombreSeguro(String nombre) {
        return nombre == null ? "" : normalizarNombre(nombre);
    }

    private String nombreNormalizadoOriginal(Document doc, String selector, String nombreNormalizado) {
        return doc.select(selector).stream()
                .map(e -> e.text() != null ? e.text().trim() : "")
                .filter(this::esNombreValido)
                .filter(n -> normalizarNombre(n).equals(nombreNormalizado))
                .findFirst()
                .orElse(nombreNormalizado);
    }

    private CloseableHttpClient createClient() {
        return HttpClients.custom()
                .setDefaultCookieStore(new BasicCookieStore())
                .build();
    }

    private Document getPage(CloseableHttpClient client, HttpClientContext context, String url)
            throws IOException {

        HttpGet get = new HttpGet(url);

        return client.execute(get, context, response -> {
            int code = response.getCode();
            if (code >= 400) {
                throw new ServiceException("GET falló " + code + " en " + url);
            }

            String html = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
            return Jsoup.parse(html, url);
        });
    }

    private void postForm(CloseableHttpClient client, HttpClientContext context, String url, Map<String, String> data)
            throws IOException {

        List<NameValuePair> params = new ArrayList<>();
        for (Map.Entry<String, String> e : data.entrySet()) {
            if (e.getKey() == null)
                continue;
            params.add(new BasicNameValuePair(e.getKey(), e.getValue() == null ? "" : e.getValue()));
        }

        HttpPost post = new HttpPost(url);
        post.setEntity(new UrlEncodedFormEntity(params, StandardCharsets.UTF_8));

        client.execute(post, context, response -> {
            int code = response.getCode();
            if (code >= 400) {
                throw new ServiceException("POST falló " + code + " en " + url);
            }

            if (response.getEntity() != null) {
                EntityUtils.consume(response.getEntity());
            }

            return null;
        });
    }

    private Map<String, String> extractFormValues(Document doc) {
        Map<String, String> values = new LinkedHashMap<>();

        for (Element input : doc.select("input[name]")) {
            String type = input.attr("type").toLowerCase(Locale.ROOT);

            if ("submit".equals(type) || "button".equals(type) || "file".equals(type)) {
                continue;
            }

            if (("radio".equals(type) || "checkbox".equals(type)) && !input.hasAttr("checked")) {
                continue;
            }

            values.put(input.attr("name"), input.val());
        }

        for (Element textarea : doc.select("textarea[name]")) {
            values.put(textarea.attr("name"), textarea.val());
        }

        for (Element select : doc.select("select[name]")) {
            Element selected = select.selectFirst("option[selected]");
            String value = selected != null ? selected.val() : select.val();
            values.put(select.attr("name"), value);
        }

        return values;
    }
}