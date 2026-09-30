package com.it.unical.progetto.sinfoniadigusto.controller;

import com.it.unical.progetto.sinfoniadigusto.DTO.AdminProfileDTOs.ChangePasswordPayload;
import com.it.unical.progetto.sinfoniadigusto.DTO.AdminProfileDTOs.UpdateProfilePayload;
import com.it.unical.progetto.sinfoniadigusto.model.ClientUser;
import com.it.unical.progetto.sinfoniadigusto.service.AdminProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/profile")
@CrossOrigin(origins = "http://localhost:4200") // Permette le chiamate CORS da Angular
public class AdminProfileController {

    @Autowired
    private AdminProfileService adminProfileService;

    // GET: http://localhost:8080/api/admin/profile
    @GetMapping
    public ResponseEntity<ClientUser> getProfile() {
        return ResponseEntity.ok(adminProfileService.getAdminProfile());
    }

    // PUT: http://localhost:8080/api/admin/profile/update
    @PutMapping("/update")
    public ResponseEntity<ClientUser> updateProfile(@RequestBody UpdateProfilePayload payload) {
        return ResponseEntity.ok(adminProfileService.updateProfile(payload));
    }

    // PUT: http://localhost:8080/api/admin/profile/change-password
    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordPayload payload) {
        adminProfileService.changePassword(payload);
        return ResponseEntity.ok().build();
    }
}