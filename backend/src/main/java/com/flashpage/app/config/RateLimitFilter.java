package com.flashpage.app.config;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Per-IP rate limiting for sensitive endpoints. State is in-memory (per-node) —
 * sufficient for single-instance deployments. Switch to Redis/Bucket4j for HA.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private record Rule(String method, String path, int maxAttempts, long windowSeconds) {
        boolean matches(HttpServletRequest request) {
            return method.equalsIgnoreCase(request.getMethod())
                    && path.equals(request.getRequestURI());
        }

        String key() {
            return method.toUpperCase() + " " + path;
        }
    }

    private static final List<Rule> RULES = List.of(
            new Rule("POST", "/api/auth/login", 10, 15 * 60),
            new Rule("POST", "/api/auth/forgot-password", 5, 60 * 60),
            new Rule("POST", "/api/auth/reset-password", 10, 15 * 60),
            new Rule("POST", "/api/leads/webhook", 60, 60),
            new Rule("GET", "/api/reportes/ventas", 20, 60 * 60));

    private record Bucket(int count, Instant windowStart) {}

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return findRule(request) == null;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        Rule rule = findRule(request);
        if (rule == null) {
            chain.doFilter(request, response);
            return;
        }

        String bucketKey = rule.key() + "|" + resolveIp(request);
        Instant now = Instant.now();

        Bucket bucket = buckets.compute(bucketKey, (key, existing) -> {
            if (existing == null
                    || now.getEpochSecond() - existing.windowStart().getEpochSecond() >= rule.windowSeconds()) {
                return new Bucket(1, now);
            }
            return new Bucket(existing.count() + 1, existing.windowStart());
        });

        if (bucket.count() > rule.maxAttempts()) {
            long retryAfter = rule.windowSeconds()
                    - (now.getEpochSecond() - bucket.windowStart().getEpochSecond());
            retryAfter = Math.max(retryAfter, 1);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(retryAfter));
            long retryMinutes = (retryAfter / 60) + 1;
            response.getWriter().write(
                    "{\"error\":\"Demasiadas solicitudes. Intentá de nuevo en " + retryMinutes + " minutos.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private Rule findRule(HttpServletRequest request) {
        for (Rule rule : RULES) {
            if (rule.matches(request)) {
                return rule;
            }
        }
        return null;
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
