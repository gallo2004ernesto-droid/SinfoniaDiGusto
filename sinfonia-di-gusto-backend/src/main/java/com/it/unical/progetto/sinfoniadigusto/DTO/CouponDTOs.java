package com.it.unical.progetto.sinfoniadigusto.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.it.unical.progetto.sinfoniadigusto.DTO.OrderDTOs.OrderItemRequest;
import com.it.unical.progetto.sinfoniadigusto.model.DiscountType;

public class CouponDTOs {

    public record CouponRequest(
            String code,
            String description,
            DiscountType discountType,
            BigDecimal discountValue,
            BigDecimal minOrderAmount,
            LocalDate validFrom,
            LocalDate validUntil,
            Integer usageLimit,
            Boolean active
    ) {}

    public record CouponResponse(
            Long id,
            String code,
            String description,
            DiscountType discountType,
            BigDecimal discountValue,
            BigDecimal minOrderAmount,
            LocalDate validFrom,
            LocalDate validUntil,
            Integer usageLimit,
            int usedCount,
            boolean active,
            String status
    ) {}

    // Anteprima nel checkout: codice + prodotti nel carrello
    public record CouponValidateRequest(
            String code,
            List<OrderItemRequest> items
    ) {}

    public record CouponValidationResponse(
            String code,
            DiscountType discountType,
            BigDecimal discountValue,
            BigDecimal subtotal,
            BigDecimal discountAmount,
            BigDecimal totalAfterDiscount
    ) {}
}