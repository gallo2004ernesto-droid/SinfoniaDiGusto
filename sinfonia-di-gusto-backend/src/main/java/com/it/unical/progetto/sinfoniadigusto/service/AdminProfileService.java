package com.it.unical.progetto.sinfoniadigusto.service;

import com.it.unical.progetto.sinfoniadigusto.DTO.AdminProfileDTOs.ChangePasswordPayload;
import com.it.unical.progetto.sinfoniadigusto.DTO.AdminProfileDTOs.UpdateProfilePayload;
import com.it.unical.progetto.sinfoniadigusto.model.ClientUser; // Modifica con la tua classe Entity Admin/User
import com.it.unical.progetto.sinfoniadigusto.model.Role;
import com.it.unical.progetto.sinfoniadigusto.repository.ClientUserRepository; // Modifica col tuo Repository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminProfileService {

    @Autowired
    private ClientUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Recupera il primo admin censito o l'utente corrente dalla sessione/DB
    public ClientUser getAdminProfile() {
        return userRepository.findByRole(Role.ROLE_ADMIN)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Utente Admin non trovato nel database"));
    }

    public ClientUser updateProfile(UpdateProfilePayload payload) {
    	ClientUser admin = getAdminProfile();
        admin.setFirstName(payload.name());
        admin.setEmail(payload.email());
        return userRepository.save(admin);
    }

    public void changePassword(ChangePasswordPayload payload) {
        ClientUser admin = getAdminProfile();

        // Controllo corrispondenza vecchia password
        if (!passwordEncoder.matches(payload.currentPassword(), admin.getPassword())) {
            throw new IllegalArgumentException("La password attuale non è corretta.");
        }

        admin.setPassword(passwordEncoder.encode(payload.NewPassword()));
        userRepository.save(admin);
    }
}
