package com.easytrack.backend.service;

import com.easytrack.backend.dto.AuthResponse;
import com.easytrack.backend.dto.LoginRequest;
import com.easytrack.backend.dto.RegisterRequest;
import com.easytrack.backend.entity.User;
import com.easytrack.backend.mapper.UserMapper;
import com.easytrack.backend.repository.UserRepository;
import com.easytrack.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        System.out.println(" Registration request for: " + request.getEmail());

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            System.err.println("    User already exists: " + request.getEmail());
            throw new RuntimeException("User with this email already exists");
        }

        // Create new user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        // Use passwordHash field (not password)
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsEmailVerified(false);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        System.out.println("    User created with ID: " + savedUser.getId());

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getEmail());
        System.out.println("    JWT token generated");

        // Return response
        return new AuthResponse(
                token, userMapper.toDTO(savedUser)
        );
    }

    public AuthResponse login(LoginRequest request) {
        System.out.println(" Login request for: " + request.getEmail());

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            System.out.println("   Authentication successful");

            // Get user
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());
            System.out.println("    JWT token generated");

            // Return response
            return new AuthResponse(
                    token, userMapper.toDTO(user)
            );

        } catch (Exception e) {
            System.err.println("    Login failed: " + e.getMessage());
            throw new RuntimeException("Invalid email or password");
        }
    }
}