package com.kothari.dashboard.security.filter;

import com.kothari.dashboard.auth.entity.User;
import com.kothari.dashboard.auth.repository.UserRepository;
import com.kothari.dashboard.auth.service.TokenService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

/**
 * JWT Authentication Filter.
 * Validates access tokens, enforces claim integrity, and verifies token version
 * against the database for instant remote session invalidation.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);

            if (tokenService.validateToken(jwt)) {
                Claims claims = tokenService.parseClaims(jwt);
                String tokenType = claims.get("type", String.class);

                // Reject temporary MFA tokens on protected resource endpoints
                if ("ACCESS".equals(tokenType)) {
                    UUID userId = UUID.fromString(claims.getSubject());
                    Integer tokenVersion = claims.get("token_version", Integer.class);

                    // Verify token version against user entity for instant killswitch
                    Optional<User> userOpt = userRepository.findById(userId);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        if (tokenVersion != null && tokenVersion == user.getTokenVersion()) {
                            String role = claims.get("role", String.class);
                            var authorities = Collections.singletonList(new SimpleGrantedAuthority(role));

                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(user.getId().toString(), null, authorities);
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        } else {
                            log.warn("Rejected stale JWT token for user: {} (token version {} vs current {})",
                                    user.getUsername(), tokenVersion, user.getTokenVersion());
                        }
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}

