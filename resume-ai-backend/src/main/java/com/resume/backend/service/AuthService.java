package com.resume.backend.service;

import com.resume.backend.dto.LoginRequest;
import com.resume.backend.dto.LoginResponse;
import com.resume.backend.dto.RegisterRequest;
import com.resume.backend.entity.User;
import com.resume.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    public LoginResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        // Generate token
        String token = jwtService.generateToken(user);

        return LoginResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .message("Registration successful")
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get user details
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate token
            String token = jwtService.generateToken(user);

            return LoginResponse.builder()
                    .token(token)
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .message("Login successful")
                    .build();

        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }
    }

    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }
}