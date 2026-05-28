package com.flashpage.app.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.flashpage.app.exception.UnauthorizedException;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expirationHours}")
    private long expiration;

    private SecretKey getSigningKey() {
        log.debug("Cargando clave de firma JWT desde el secreto configurado.");
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String dni, String role) {
        log.info("Generando nuevo token JWT para el usuario: {} con rol: {}", dni, role);

        Instant now = Instant.now();
        Instant expiryDate = now.plus(expiration, ChronoUnit.HOURS);

        String token = Jwts.builder()
                .subject(dni)
                .claim("rol", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiryDate))
                .signWith(getSigningKey())
                .compact();

        log.info(" Token generado exitosamente. Expira el: {}", expiryDate);
        return token;
    }

    public Claims validateToken(String token) {
        log.debug("Iniciando validación de token JWT...");

        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.warn(" Fallo en la validación del token: {}", e.getMessage());
            throw new UnauthorizedException("Token JWT inválido o expirado");
        }
    }

    public String extractDni(String token) {
        String subject = validateToken(token).getSubject();
        log.debug("Identidad extraída del token: {}", subject);
        return subject;
    }
}