package com.flashpage.app.config;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.flashpage.app.exception.UnauthorizedException;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.repository.UsuarioRepository;
import com.flashpage.app.service.JwtService;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    private final UsuarioRepository repository;
    private final JwtService jwtService;

    public JwtFilter(UsuarioRepository repository, JwtService jwtService) {
        this.repository = repository;
        this.jwtService = jwtService;
    }

    @Value("${cookie.secure}")
    private boolean isSecure;

    @Value("${cookie.domain}")
    private String domain;

    @Value("${cookie.sameSite}")
    private String sameSite;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/logout")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = null;

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token == null && request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Claims claims = jwtService.validateToken(token);
                String dni = claims.getSubject();

                Usuario usuario = repository.findByDni(dni)
                        .orElseThrow();

                if (!usuario.isActivo()) {
                    log.warn("Intento de acceso con usuario inactivo: {}", dni);
                    throw new UnauthorizedException("Usuario inactivo");
                }

                List<GrantedAuthority> authorities = List
                        .of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()));

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(usuario, null,
                        authorities);

                SecurityContextHolder.getContext().setAuthentication(auth);
                log.debug("Autenticación exitosa para: {} [{}]", dni, usuario.getRol());

            } catch (Exception e) {
                log.warn("Fallo de autenticación JWT en {} - {}: {}", path, e.getClass().getSimpleName(),
                        e.getMessage());
                SecurityContextHolder.clearContext();

                ResponseCookie cookie = ResponseCookie.from("token", "")
                        .httpOnly(true)
                        .secure(isSecure)
                        .path("/")
                        .domain(domain)
                        .maxAge(0)
                        .sameSite(sameSite)
                        .build();

                response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
