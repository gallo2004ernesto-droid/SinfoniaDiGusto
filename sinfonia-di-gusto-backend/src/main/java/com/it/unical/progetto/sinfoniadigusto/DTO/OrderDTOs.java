package com.it.unical.progetto.sinfoniadigusto.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.it.unical.progetto.sinfoniadigusto.model.OrderStatus;

public class OrderDTOs {

    public record OrderItemRequest(Long productId, Integer quantity) {}

    public record CreateOrderRequest(
        List<OrderItemRequest> items,
        String firstName,
        String lastName,
        String phone,
        String address,
        String city,
        String postalCode,
        String notes,
        String paymentMethod,
        String couponCode
    ) {}

    public record OrderItemResponse(
        Long id, 
        Long productId, 
        String productName, 
        Integer quantity, 
        BigDecimal price,
        String productImageUrl
    ) {}

    // Record esteso per includere tutti i dati di spedizione, pagamento e sconto
    public record OrderResponse(
        Long id, 
        Long userId, 
        String userEmail, 
        LocalDateTime orderDate, 
        OrderStatus status, 
        BigDecimal totalAmount, 
        String firstName,
        String lastName,
        String phone,
        String address,
        String city,
        String postalCode,
        String notes,
        String paymentMethod,
        List<OrderItemResponse> items,
        String couponCode,
        BigDecimal discountAmount,
        BigDecimal subtotal,
        BigDecimal shippingCost
    ) {}
}