package com.it.unical.progetto.sinfoniadigusto.DTO;

import java.math.BigDecimal;
import java.util.List;

import com.it.unical.progetto.sinfoniadigusto.DTO.BadgeDTOs.BadgeResponse;

public class ProductDTOs {

    public record ProductRequest(
            String name,
            String description,
            BigDecimal price,
            BigDecimal originalPrice,
            Integer stockQuantity,
            String imageUrl,
            String bgColor,
            String pdfUrl,
            Long categoryId,
            List<Long> badgeIds
    ) {}

    public record ProductResponse(
            Long id,
            String name,
            String description,
            BigDecimal price,
            BigDecimal originalPrice,
            Integer stockQuantity,
            Boolean isOffer,
            Integer discountPercent,
            Boolean featured,
            String imageUrl,
            String bgColor,
            String pdfUrl,
            Long categoryId,
            String categoryName,
            List<BadgeResponse> badges
    ) {}
}