package com.it.unical.progetto.sinfoniadigusto.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.it.unical.progetto.sinfoniadigusto.DTO.UserDTOs.UserProfileResponse;
import com.it.unical.progetto.sinfoniadigusto.exception.ResourceNotFoundException;
import com.it.unical.progetto.sinfoniadigusto.model.ClientUser;
import com.it.unical.progetto.sinfoniadigusto.repository.ClientUserRepository;

@Service
public class UserService {

    @Autowired
    private ClientUserRepository userRepository;

    public UserProfileResponse getUserProfile(String email) {
        ClientUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato con email: " + email));

        return mapToProfile(user);
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToProfile)
                .toList();
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Utente non trovato con id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    @Transactional
    public UserProfileResponse toggleUserStatus(Long userId) {
        ClientUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato con ID: " + userId));

        user.setActive(!user.isActive());
        ClientUser updated = userRepository.save(user);
        return mapToProfile(updated);
    }

    private UserProfileResponse mapToProfile(ClientUser user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getRegistrationDate()
        );
    }
}
