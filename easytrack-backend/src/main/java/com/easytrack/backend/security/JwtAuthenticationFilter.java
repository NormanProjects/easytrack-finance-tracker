package com.easytrack.backend.security;

import com.easytrack.backend.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("🔍 JWT Filter - URL: " + request.getRequestURI());

        final String authorizationHeader = request.getHeader("Authorization");
        System.out.println("   Authorization header: " + (authorizationHeader != null ? "Bearer ..." : "null"));

        String email = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            System.out.println("   Token extracted: " + jwt.substring(0, Math.min(20, jwt.length())) + "...");

            // ⚠️ DEVELOPMENT MODE: Accept mock tokens
            if (jwt.startsWith("mock-jwt-token")) {
                System.out.println("   ⚠️ Mock token detected - creating mock authentication");

                // Create mock UserDetails for development
                UserDetails mockUserDetails = org.springframework.security.core.userdetails.User
                        .withUsername("demo@test.com")
                        .password("") // Not needed for mock
                        .authorities(new ArrayList<>())
                        .build();

                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                                mockUserDetails, null, mockUserDetails.getAuthorities());
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                System.out.println("   ✅ Mock authentication set for user: demo@test.com");
                filterChain.doFilter(request, response);
                return;
            }

            // Real JWT token processing
            try {
                email = jwtUtil.extractEmail(jwt);
                System.out.println("   Email extracted from token: " + email);
            } catch (Exception e) {
                System.out.println("   ❌ Token is invalid: " + e.getMessage());
            }
        } else {
            System.out.println("   ⚠️ No Authorization header or invalid format");
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);

            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                System.out.println("   ✅ Real authentication set for user: " + email);
            } else {
                System.out.println("   ❌ Token validation failed");
            }
        }

        filterChain.doFilter(request, response);
    }
}