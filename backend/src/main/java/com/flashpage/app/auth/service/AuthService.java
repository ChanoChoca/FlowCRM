package com.flashpage.app.auth.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.auth.dto.ForgotPasswordRequest;
import com.flashpage.app.auth.dto.LoginRequest;
import com.flashpage.app.auth.dto.ResetPasswordRequest;
import com.flashpage.app.auth.model.PasswordResetToken;
import com.flashpage.app.auth.repository.PasswordResetTokenRepository;
import com.flashpage.app.comunicacion.service.EmailService;
import com.flashpage.app.shared.exception.NotFoundException;
import com.flashpage.app.shared.exception.ValidationException;
import com.flashpage.app.usuario.dto.UsuarioAuthResponse;
import com.flashpage.app.usuario.dto.UsuarioSupervisorResponse;
import com.flashpage.app.usuario.model.Usuario;
import com.flashpage.app.usuario.repository.UsuarioRepository;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${cookie.secure}")
    private boolean isSecure;

    @Value("${cookie.domain}")
    private String domain;

    @Value("${cookie.sameSite}")
    private String sameSite;

    @Value("${jwt.expirationHours}")
    private int expirationHours;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService,
            UsuarioRepository usuarioRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public ResponseCookie login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.dni(), request.password()));

        Usuario usuario = usuarioRepository.findByDni(request.dni()).orElseThrow();
        usuario.setUltimoLogin(LocalDateTime.now());
        usuarioRepository.save(usuario);

        return createLoginCookie(auth);
    }

    public UsuarioAuthResponse getCurrentUser(Usuario usuario) {
        Usuario supervisor = usuario.getSupervisor();
        return new UsuarioAuthResponse(
                usuario.getId(),
                usuario.getDni(),
                usuario.getPassword(),
                usuario.getRol(),
                supervisor != null
                        ? new UsuarioSupervisorResponse(supervisor.getId(), supervisor.getNombre(), supervisor.getApellido())
                        : null,
                usuario.getTelefono(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getPlazaUsername(),
                usuario.getPlazaPassword(),
                usuario.isActivo(),
                usuario.isRankingOptActivo(),
                usuario.getUltimoLogin(),
                usuario.getCreadoEn(),
                usuario.getActualizadoEn(),
                usuario.getEmail(),
                usuario.getGoogleId() != null);
    }

    public ResponseCookie createLoginCookie(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        String token = jwtService.generateToken(username, role);
        int maxAge = expirationHours * 3600;

        return ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(isSecure)
                .path("/")
                .domain(domain)
                .maxAge(maxAge)
                .sameSite(sameSite)
                .build();
    }

    public ResponseCookie createRefreshCookie(String dni, String role) {
        String token = jwtService.generateToken(dni, "ROLE_" + role);
        int maxAge = expirationHours * 3600;

        return ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(isSecure)
                .path("/")
                .domain(domain)
                .maxAge(maxAge)
                .sameSite(sameSite)
                .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByDni(request.dni());

        if (usuarioOpt.isEmpty()) {
            log.info("Solicitud de recuperación para DNI inexistente: {}", request.dni());
            return;
        }

        Usuario usuario = usuarioOpt.get();

        if (!usuario.isActivo()) {
            log.info("Solicitud de recuperación para usuario inactivo: {}", usuario.getDni());
            return;
        }

        if (usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            log.warn("Usuario {} no tiene email registrado para recuperación", usuario.getDni());
            return;
        }

        passwordResetTokenRepository.deleteByUser(usuario);

        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUsuario(usuario);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        passwordResetTokenRepository.save(token);

        String nombreCompleto = (usuario.getNombre() + " " + usuario.getApellido()).trim();
        emailService.enviarRecuperacionPassword(usuario.getEmail(), nombreCompleto, token.getToken());

        log.info("Token de recuperación generado para usuario: {}", usuario.getDni());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new NotFoundException("Token inválido"));

        if (token.isUsed()) throw new ValidationException("Token ya utilizado");
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) throw new ValidationException("Token expirado");

        Usuario usuario = token.getUsuario();
        usuario.setPassword(passwordEncoder.encode(request.password()));
        usuarioRepository.save(usuario);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        log.info("Contraseña restablecida exitosamente para usuario: {}", usuario.getDni());
    }

    public ResponseCookie createLogoutCookie() {
        return ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(isSecure)
                .path("/")
                .domain(domain)
                .maxAge(0)
                .sameSite(sameSite)
                .build();
    }
}
