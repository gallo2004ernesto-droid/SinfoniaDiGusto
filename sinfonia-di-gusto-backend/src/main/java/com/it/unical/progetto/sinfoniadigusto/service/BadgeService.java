package com.it.unical.progetto.sinfoniadigusto.service;

import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.it.unical.progetto.sinfoniadigusto.DTO.BadgeDTOs.BadgeRequest;
import com.it.unical.progetto.sinfoniadigusto.DTO.BadgeDTOs.BadgeResponse;
import com.it.unical.progetto.sinfoniadigusto.exception.BadRequestException;
import com.it.unical.progetto.sinfoniadigusto.exception.ResourceNotFoundException;
import com.it.unical.progetto.sinfoniadigusto.model.Badge;
import com.it.unical.progetto.sinfoniadigusto.repository.BadgeRepository;

@Service
public class BadgeService {

    // Codici dei badge di sistema
    public static final String CODE_FEATURED = "FEATURED";
    public static final String CODE_OFFER = "OFFER";

    private static final Pattern HEX_COLOR =
            Pattern.compile("^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$");

    @Autowired
    private BadgeRepository badgeRepository;

    // Pubblico: solo badge attivi
    public List<BadgeResponse> getActiveBadges() {
        return badgeRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(BadgeService::toResponse)
                .toList();
    }

    // Admin: tutti
    public List<BadgeResponse> getAllBadges() {
        return badgeRepository.findAllByOrderByNameAsc().stream()
                .map(BadgeService::toResponse)
                .toList();
    }

    @Transactional
    public BadgeResponse createBadge(BadgeRequest request) {
        validate(request);
        String code = normalizeCode(request.code());

        if (badgeRepository.existsByCode(code)) {
            throw new BadRequestException("Esiste già un badge con questo codice.");
        }

        Badge badge = new Badge();
        apply(badge, request, code);
        return toResponse(badgeRepository.save(badge));
    }

    @Transactional
    public BadgeResponse updateBadge(Long id, BadgeRequest request) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badge non trovato con ID: " + id));

        validate(request);

        // Il codice di un badge di sistema non si può cambiare
        String code = badge.isSystem()
                ? badge.getCode()
                : normalizeCode(request.code());

        if (badgeRepository.existsByCodeAndIdNot(code, id)) {
            throw new BadRequestException("Esiste già un altro badge con questo codice.");
        }

        apply(badge, request, code);
        return toResponse(badgeRepository.save(badge));
    }

    @Transactional
    public void deleteBadge(Long id) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badge non trovato con ID: " + id));

        if (badge.isSystem()) {
            throw new BadRequestException("I badge di sistema non possono essere eliminati.");
        }
        if (badgeRepository.countProductsUsingBadge(id) > 0) {
            throw new BadRequestException(
                    "Impossibile eliminare il badge: è assegnato ad alcuni prodotti.");
        }
        badgeRepository.delete(badge);
    }

    // ---------- Helper ----------

    private void validate(BadgeRequest r) {
        if (r.name() == null || r.name().isBlank()) {
            throw new BadRequestException("Il nome del badge è obbligatorio.");
        }
        if (r.code() == null || r.code().isBlank()) {
            throw new BadRequestException("Il codice del badge è obbligatorio.");
        }
        if (!isHexColor(r.backgroundColor())) {
            throw new BadRequestException("Colore di sfondo non valido (es. #ff0000).");
        }
        if (!isHexColor(r.textColor())) {
            throw new BadRequestException("Colore del testo non valido (es. #ffffff).");
        }
    }

    private boolean isHexColor(String value) {
        return value != null && HEX_COLOR.matcher(value).matches();
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase().replaceAll("\\s+", "_");
    }

    private void apply(Badge badge, BadgeRequest r, String code) {
        badge.setName(r.name().trim());
        badge.setCode(code);
        badge.setBackgroundColor(r.backgroundColor());
        badge.setTextColor(r.textColor());
        badge.setIcon(r.icon());
        badge.setActive(r.active() == null || r.active());
    }

    public static BadgeResponse toResponse(Badge b) {
        return new BadgeResponse(
                b.getId(),
                b.getName(),
                b.getCode(),
                b.getBackgroundColor(),
                b.getTextColor(),
                b.getIcon(),
                b.isActive(),
                b.isSystem());
    }
}