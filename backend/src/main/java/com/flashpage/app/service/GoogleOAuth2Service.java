package com.flashpage.app.service;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.flashpage.app.config.GoogleOAuth2Properties;
import com.flashpage.app.exception.ServiceException;
import com.flashpage.app.exception.UnauthorizedException;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.repository.UsuarioRepository;

@Service
public class GoogleOAuth2Service {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuth2Service.class);

    private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
    private static final String SCOPE = "openid email profile";

    private final GoogleOAuth2Properties props;
    private final UsuarioRepository usuarioRepository;
    private final WebClient webClient;

    public GoogleOAuth2Service(GoogleOAuth2Properties props,
            UsuarioRepository usuarioRepository,
            WebClient webClient) {
        this.props = props;
        this.usuarioRepository = usuarioRepository;
        this.webClient = webClient;
    }

    public String buildAuthorizationUrl(String state) {
        return GOOGLE_AUTH_URL
                + "?client_id=" + props.getClientId()
                + "&redirect_uri=" + props.getRedirectUri()
                + "&response_type=code"
                + "&scope=" + SCOPE.replace(" ", "%20")
                + "&access_type=offline"
                + "&prompt=select_account"
                + "&state=" + state;
    }

    /**
     * Exchanges the authorization code for an access token and returns Google user info.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> exchangeCodeForUserInfo(String code) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", props.getClientId());
        params.add("client_secret", props.getClientSecret());
        params.add("redirect_uri", props.getRedirectUri());
        params.add("grant_type", "authorization_code");

        Map<String, Object> tokenResponse = webClient.post()
                .uri(GOOGLE_TOKEN_URL)
                .body(BodyInserters.fromFormData(params))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
            throw new ServiceException("No se pudo obtener el token de Google");
        }

        String accessToken = (String) tokenResponse.get("access_token");

        Map<String, Object> userInfo = webClient.get()
                .uri(GOOGLE_USERINFO_URL)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (userInfo == null || !userInfo.containsKey("sub")) {
            throw new ServiceException("No se pudo obtener la información del usuario de Google");
        }

        log.info("Usuario de Google autenticado: sub={}, email={}", userInfo.get("sub"), userInfo.get("email"));
        return userInfo;
    }

    /**
     * Finds the local Usuario linked to this Google account, or throws if none is linked.
     */
    public Usuario findUsuarioByGoogleId(String googleId) {
        return usuarioRepository.findByGoogleId(googleId)
                .orElseThrow(() -> new UnauthorizedException(
                        "No hay ninguna cuenta vinculada a este perfil de Google. " +
                        "Iniciá sesión con DNI y contraseña, luego vinculá tu cuenta en el perfil."));
    }

    /**
     * Links a Google account to the Usuario identified by id. Fails if the Google account is already linked to another user.
     */
    public void linkGoogleAccountById(Long userId, Map<String, Object> googleUserInfo) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new ServiceException("Usuario no encontrado con id: " + userId));
        linkGoogleAccount(usuario, googleUserInfo);
    }

    /**
     * Links a Google account to an existing Usuario. Fails if the Google account is already linked to another user.
     */
    public void linkGoogleAccount(Usuario usuario, Map<String, Object> googleUserInfo) {
        String googleId = (String) googleUserInfo.get("sub");
        String email = (String) googleUserInfo.get("email");

        usuarioRepository.findByGoogleId(googleId).ifPresent(existing -> {
            if (!existing.getId().equals(usuario.getId())) {
                throw new ServiceException("Esta cuenta de Google ya está vinculada a otro usuario");
            }
        });

        usuario.setGoogleId(googleId);
        usuario.setEmail(email);
        usuarioRepository.save(usuario);
        log.info("Cuenta de Google vinculada para usuario id={}, email={}", usuario.getId(), email);
    }

    /**
     * Removes the Google link from a Usuario.
     */
    public void unlinkGoogleAccount(Usuario usuario) {
        usuario.setGoogleId(null);
        usuario.setEmail(null);
        usuarioRepository.save(usuario);
        log.info("Cuenta de Google desvinculada para usuario id={}", usuario.getId());
    }
}
