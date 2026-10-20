package com.it.unical.progetto.sinfoniadigusto.config;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import com.it.unical.progetto.sinfoniadigusto.model.Badge;
import com.it.unical.progetto.sinfoniadigusto.model.ClientUser;
import com.it.unical.progetto.sinfoniadigusto.model.Product;
import com.it.unical.progetto.sinfoniadigusto.model.Role;
import com.it.unical.progetto.sinfoniadigusto.repository.BadgeRepository;
import com.it.unical.progetto.sinfoniadigusto.repository.ClientUserRepository;
import com.it.unical.progetto.sinfoniadigusto.repository.ProductRepository;
import com.it.unical.progetto.sinfoniadigusto.service.BadgeService;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ClientUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TransactionTemplate transactionTemplate;

    @Override
    public void run(String... args) {
        createAdminUser();
        createSystemBadges();
    }

    private void createAdminUser() {
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
            System.err.println(">>> ERRORE IN DATA INITIALIZER (admin): " + e.getMessage());
            e.printStackTrace();
        }
    }

    
    // BADGE DI SISTEMA
    private void createSystemBadges() {
        try {
            transactionTemplate.executeWithoutResult(status -> {

                // \u2B50 = stella, \uD83D\uDD25 = fiamma
                Badge featured = ensureSystemBadge(
                        BadgeService.CODE_FEATURED,
                        "In Evidenza",
                        "#d97706",
                        "#ffffff",
                        "\u2B50");

                Badge offer = ensureSystemBadge(
                        BadgeService.CODE_OFFER,
                        "In Offerta",
                        "#dc2626",
                        "#ffffff",
                        "\uD83D\uDD25");

                syncProductsWithSystemBadges(featured, offer);
            });

            System.out.println(">>> DATA INITIALIZER: Badge di sistema verificati.");

        } catch (Exception e) {
            System.err.println(">>> ERRORE IN DATA INITIALIZER (badge): " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Crea il badge se non esiste. Se esiste già (es. creato a mano per prova),
    // lo promuove a badge di sistema mantenendo nome e colori.
    private Badge ensureSystemBadge(String code, String name,
                                    String backgroundColor, String textColor, String icon) {

        return badgeRepository.findByCode(code)
                .map(existing -> {
                    if (!existing.isSystem()) {
                        existing.setSystem(true);
                        return badgeRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    Badge badge = new Badge();
                    badge.setName(name);
                    badge.setCode(code);
                    badge.setBackgroundColor(backgroundColor);
                    badge.setTextColor(textColor);
                    badge.setIcon(icon);
                    badge.setActive(true);
                    badge.setSystem(true);
                    return badgeRepository.save(badge);
                });
    }

    // Migrazione dei vecchi flag: i prodotti già in evidenza o in offerta
    // ricevono il badge, e i flag riflettono sempre i badge assegnati.
    private void syncProductsWithSystemBadges(Badge featured, Badge offer) {

        for (Product product : productRepository.findAll()) {
            boolean changed = false;

            if (Boolean.TRUE.equals(product.getFeatured()) && !has(product, featured)) {
                product.getBadges().add(featured);
                changed = true;
            }

            if (Boolean.TRUE.equals(product.getIsOffer()) && !has(product, offer)) {
                product.getBadges().add(offer);
                changed = true;
            }

            boolean isFeatured = has(product, featured);
            boolean isOffer = has(product, offer);

            if (!Boolean.valueOf(isFeatured).equals(product.getFeatured())) {
                product.setFeatured(isFeatured);
                changed = true;
            }

            if (!Boolean.valueOf(isOffer).equals(product.getIsOffer())) {
                product.setIsOffer(isOffer);
                changed = true;
            }

            if (changed) {
                productRepository.save(product);
            }
        }
    }

    private boolean has(Product product, Badge badge) {
        return product.getBadges().stream()
                .anyMatch(b -> b.getId().equals(badge.getId()));
    }
}