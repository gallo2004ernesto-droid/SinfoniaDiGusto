package com.it.unical.progetto.sinfoniadigusto.config;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.it.unical.progetto.sinfoniadigusto.model.ClientUser;
import com.it.unical.progetto.sinfoniadigusto.model.Role;
import com.it.unical.progetto.sinfoniadigusto.repository.ClientUserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ClientUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            if (!userRepository.existsByEmail("admin@sinfonia.it")) {
                ClientUser admin = new ClientUser();
                admin.setFirstName("Admin");
                admin.setLastName("Sinfonia");
                admin.setEmail("admin@sinfonia.it");
                admin.setPassword(passwordEncoder.encode("AdminPassword123!"));
                admin.setRole(Role.ROLE_ADMIN);
                admin.setActive(true);
                admin.setRegistrationDate(LocalDate.now());

                userRepository.saveAndFlush(admin); // Forza la scrittura immediata su PostgreSQL
                System.out.println(">>> DATA INITIALIZER: Utente ADMIN creato con successo!");
            } else {
                System.out.println(">>> DATA INITIALIZER: Utente ADMIN già presente nel database.");
            }
        } catch (Exception e) {
            System.err.println(">>> ERRORE IN DATA INITIALIZER: " + e.getMessage());
            e.printStackTrace();
        }
    }
}