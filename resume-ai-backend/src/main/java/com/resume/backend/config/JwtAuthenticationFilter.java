// intercepts every request, extract JWT from header and validate it and set authentication in security context if valid. 
package com.resume.backend.config;

import com.resume.backend.service.CustomUserDetailsService;
import com.resume.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {// runs once per request

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    // List of public endpoints that don't need JWT validation
    private final List<String> publicEndpoints = Arrays.asList(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/check-email"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) { // return true and this filter's main logic (doFilterInternal) gets skipped entirely for this request
        String path = request.getRequestURI(); // for http://localhost:8080/login gives /login
        // Skip filter for public endpoints
        return publicEndpoints.stream().anyMatch(path::startsWith); // does the request's path start with one of these three public paths?" If yes → skip the whole JWT check
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization"); // Authorization: Bearer <JWT>
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7); // Removes "Bearer " prefix
        userEmail = jwtService.extractUsername(jwt); // Extracts email from token payload

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail); // load user from DB 

            if (jwtService.validateToken(jwt, userDetails)) { // Validates token (checks signature, expiration, and that email in token matches user email)
                // JWT + SECRET_KEY → verify. Secret key is with the server
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, // who user
                        null,
                        userDetails.getAuthorities()  // ROLE_USER, from getAuthorities()
                ); // user is authenticated
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        chain.doFilter(request, response); // This filter never itself sends a "rejected" response — it either sets identity or doesn't, and lets Spring Security's later authorization check decide the outcome.
    }
}
/*
This filter runs on every request except the whitelisted public ones. It looks for a Bearer token;
if there isn't one, it does nothing and moves on. If there is one, it decodes the email, re-fetches the actual user from the database, 
verifies the token's signature/expiry/email-match, and — only if everything checks out — marks the current request as "authenticated as this user" in Spring Security's context.
Either way, the request continues to the next filter; this class never blocks anything itself, it only decides whether to attach an identity.

*/
