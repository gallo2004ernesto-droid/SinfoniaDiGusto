package com.it.unical.progetto.sinfoniadigusto.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.it.unical.progetto.sinfoniadigusto.DTO.UserDTOs.UserProfileResponse;
import com.it.unical.progetto.sinfoniadigusto.exception.BadRequestException;
import com.it.unical.progetto.sinfoniadigusto.exception.ResourceNotFoundException;
import com.it.unical.progetto.sinfoniadigusto.model.ClientUser;
import com.it.unical.progetto.sinfoniadigusto.model.Role;
import com.it.unical.progetto.sinfoniadigusto.repository.ClientUserRepository;
import com.it.unical.progetto.sinfoniadigusto.repository.OrderRepository;

@Service
public class UserService {

    private final OrderRepository orderRepository;
    @Autowired
    private ClientUserRepository userRepository;

    UserService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public UserProfileResponse getUserProfile(String email) {
        ClientUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato con email: " + email));

        return mapToProfile(user);
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(user -> !user.getRole().equals(Role.ROLE_ADMIN))
                .map(this::mapToProfile)
                .toList();
    }

    @Transactional
    public void deleteClient(Long id, String currentUserEmail) {
        ClientUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente non trovato con ID: " + id));

        if (user.getEmail().equals(currentUserEmail)) {
            throw new BadRequestException("Non puoi eliminare il tuo stesso account.");
        }

        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new BadRequestException("Un amministratore non può essere eliminato da qui.");
        }

        if (orderRepository.existsByUserId(id)) {
            throw new BadRequestException(
                    "Questo cliente ha degli ordini e non può essere eliminato. Puoi bloccarlo.");
        }

        userRepository.delete(user);
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
