package com.flashpage.app.shared.config;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class N8nSecretFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(N8nSecretFilter.class);

    private static final String HEADER = "n8n-secret";
    private static final String PATH = "/api/ventas/estados";

    @Value("${n8n.secret}")
    private String secret;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        if (!PATH.equals(request.getServletPath())) {
            filterChain.doFilter(request, response);
            return;
        }

        String provided = request.getHeader(HEADER);
        if (provided == null || !provided.equals(secret)) {
            log.warn("Petición a {} rechazada: secret inválido o ausente", PATH);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        AnonymousAuthenticationToken auth = new AnonymousAuthenticationToken(
                "n8n",
                "n8n",
                java.util.List.of(new SimpleGrantedAuthority("ROLE_N8N")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }
}
