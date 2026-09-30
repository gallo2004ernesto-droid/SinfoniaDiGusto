package com.it.unical.progetto.sinfoniadigusto.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.it.unical.progetto.sinfoniadigusto.DTO.CouponDTOs.CouponRequest;
import com.it.unical.progetto.sinfoniadigusto.DTO.CouponDTOs.CouponResponse;
import com.it.unical.progetto.sinfoniadigusto.DTO.CouponDTOs.CouponValidateRequest;
import com.it.unical.progetto.sinfoniadigusto.DTO.CouponDTOs.CouponValidationResponse;
import com.it.unical.progetto.sinfoniadigusto.service.CouponService;

@RestController
@RequestMapping("/api/v1/coupons")
@CrossOrigin(origins = "*")
public class CouponController {

    @Autowired
    private CouponService couponService;

    // ----- Solo admin -----

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> createCoupon(@RequestBody CouponRequest request) {
        return new ResponseEntity<>(couponService.createCoupon(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> updateCoupon(@PathVariable Long id,
                                                       @RequestBody CouponRequest request) {
        return ResponseEntity.ok(couponService.updateCoupon(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    // ----- Cliente loggato: anteprima sconto nel checkout -----

    @PostMapping("/validate")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CouponValidationResponse> validateCoupon(@RequestBody CouponValidateRequest request) {
        return ResponseEntity.ok(couponService.validate(request));
    }
}