package com.it.unical.progetto.sinfoniadigusto.service;

import com.it.unical.progetto.sinfoniadigusto.DTO.AuthDTOs.*;
import com.it.unical.progetto.sinfoniadigusto.exception.BadRequestException;
import com.it.unical.progetto.sinfoniadigusto.model.ClientUser;
import com.it.unical.progetto.sinfoniadigusto.model.Role;
import com.it.unical.progetto.sinfoniadigusto.repository.ClientUserRepository;
import com.it.unical.progetto.sinfoniadigusto.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private ClientUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("L'email inserita è già associata a un account esistente.");
        }

        ClientUser user = new ClientUser(
                request.firstName(),
                request.lastName(),
                request.email(),
                passwordEncoder.encode(request.password()),
                Role.ROLE_USER,
                true
        );

        userRepository.save(user);

        String token = jwtUtil.generateToken(user);

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName()
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        ClientUser user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Credenziali non valide."));

        String token = jwtUtil.generateToken(user);

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName()
        );
    }
}
