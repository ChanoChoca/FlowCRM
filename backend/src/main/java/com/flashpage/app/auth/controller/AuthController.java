package com.flashpage.app.auth.controller;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.auth.dto.ForgotPasswordRequest;
import com.flashpage.app.auth.dto.LoginRequest;
import com.flashpage.app.auth.dto.ResetPasswordRequest;
import com.flashpage.app.auth.service.AuthService;
import com.flashpage.app.auth.service.GoogleOAuth2Service;
import com.flashpage.app.usuario.dto.UsuarioAuthResponse;
import com.flashpage.app.usuario.model.Usuario;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuth2Service googleOAuth2Service;

    @Value("${frontend.url}")
    private String frontendUrl;

    public AuthController(AuthService authService, GoogleOAuth2Service googleOAuth2Service) {
        this.authService = authService;
        this.googleOAuth2Service = googleOAuth2Service;
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response)
            throws IOException {
        ResponseCookie cookie = authService.login(request);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).build();
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioAuthResponse> me(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(authService.getCurrentUser(usuario));
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = authService.createLogoutCookie();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/google")
    public void googleRedirect(HttpServletResponse response) throws IOException {
        String state = "login:" + UUID.randomUUID();
        response.sendRedirect(googleOAuth2Service.buildAuthorizationUrl(state));
    }

    @GetMapping("/google/link")
    public void googleLinkRedirect(@AuthenticationPrincipal Usuario usuario, HttpServletResponse response)
            throws IOException {
        String state = "link:" + usuario.getId() + ":" + UUID.randomUUID();
        response.sendRedirect(googleOAuth2Service.buildAuthorizationUrl(state));
    }

    @GetMapping("/callback/google")
    public void googleCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error,
            @RequestParam(required = false) String state,
            HttpServletResponse response) throws IOException {

        if (error != null || code == null) {
            String errorTarget = (state != null && state.startsWith("link:"))
                    ? "/crm/usuarios?error=google_cancelado"
                    : "/iniciar-sesion?error=google_cancelado";
            response.sendRedirect(frontendUrl + errorTarget);
            return;
        }

        if (state != null && state.startsWith("link:")) {
            try {
                String[] parts = state.split(":", 3);
                Long userId = Long.parseLong(parts[1]);
                Map<String, Object> googleUser = googleOAuth2Service.exchangeCodeForUserInfo(code);
                googleOAuth2Service.linkGoogleAccountById(userId, googleUser);
                response.sendRedirect(frontendUrl + "/crm/usuarios?googleVinculado=true");
            } catch (Exception ex) {
                response.sendRedirect(frontendUrl + "/crm/usuarios?error=google_link_error");
            }
            return;
        }

        try {
            Map<String, Object> googleUser = googleOAuth2Service.exchangeCodeForUserInfo(code);
            String googleId = (String) googleUser.get("sub");
            Usuario usuario = googleOAuth2Service.findUsuarioByGoogleId(googleId);
            ResponseCookie cookie = authService.createRefreshCookie(usuario.getDni(), usuario.getRol().name());
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            response.sendRedirect(frontendUrl + "/crm");
        } catch (Exception ex) {
            response.sendRedirect(frontendUrl + "/iniciar-sesion?error=google_no_vinculado");
        }
    }

    @DeleteMapping("/google/link")
    public ResponseEntity<Void> googleUnlink(@AuthenticationPrincipal Usuario usuario) {
        googleOAuth2Service.unlinkGoogleAccount(usuario);
        return ResponseEntity.ok().build();
    }
}
