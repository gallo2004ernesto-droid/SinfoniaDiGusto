package com.it.unical.progetto.sinfoniadigusto.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it.unical.progetto.sinfoniadigusto.DTO.BadgeDTOs.BadgeRequest;
import com.it.unical.progetto.sinfoniadigusto.DTO.BadgeDTOs.BadgeResponse;
import com.it.unical.progetto.sinfoniadigusto.service.BadgeService;

@RestController
@RequestMapping("/api/v1/badges")
@CrossOrigin(origins = "*")
public class BadgeController {

    @Autowired
    private BadgeService badgeService;

    // Pubblico: solo badge attivi
    @GetMapping
    public ResponseEntity<List<BadgeResponse>> getActiveBadges() {
        return ResponseEntity.ok(badgeService.getActiveBadges());
    }

    // Solo admin
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BadgeResponse>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BadgeResponse> createBadge(@RequestBody BadgeRequest request) {
        return new ResponseEntity<>(badgeService.createBadge(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BadgeResponse> updateBadge(@PathVariable Long id,
                                                     @RequestBody BadgeRequest request) {
        return ResponseEntity.ok(badgeService.updateBadge(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBadge(@PathVariable Long id) {
        badgeService.deleteBadge(id);
        return ResponseEntity.noContent().build();
    }
}