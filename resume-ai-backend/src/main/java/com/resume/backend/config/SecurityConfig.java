//checkpoint that every request must pass through
// tells which api are public, which api requires authentication, how jwt is handled, how passwords are encrypted 
package com.resume.backend.config;

import com.resume.backend.security.JwtAuthenticationEntryPoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration // configuration file
@EnableWebSecurity // enables spring security
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter; // checks JWT token in requests

    @Autowired
    private JwtAuthenticationEntryPoint unauthorizedHandler; // handles unauthorized access

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // JWT is stateless
        // CORS enabled, CSRF disabled (since we are not using cookies), exception handling for unauthorized access, session management set to stateless, and authorization rules for endpoints defined.
        // CORS enabled → allows frontend (React, etc.) to call backend
        // The server does NOT store any user session data.
        http
                .cors().and()
                .csrf().disable()
                .exceptionHandling()
                .authenticationEntryPoint(unauthorizedHandler)
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) //stateless session. No sessions stored on server. Every request must carry JWT
                .and()
                .authorizeHttpRequests()

                // PUBLIC endpoints - NO TOKEN REQUIRED. Anyone can access these endpoints without authentication.
                .requestMatchers("/").permitAll()                    // Root path
                .requestMatchers("/error").permitAll()               // Error path
                .requestMatchers("/api/auth/**").permitAll()         // ALL auth endpoints
                .requestMatchers("/api/auth/register").permitAll()   // Register
                .requestMatchers("/api/auth/login").permitAll()      // Login
                .requestMatchers("/api/auth/check-email/**").permitAll()

                // PROTECTED endpoints - TOKEN REQUIRED
                .requestMatchers("/api/v1/resume/**").authenticated()

                // Any other request needs authentication
                .anyRequest().authenticated();

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); //Encrypts passwords using BCrypt algorithm.
    }
}