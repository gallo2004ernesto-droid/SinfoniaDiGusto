package com.it.unical.progetto.sinfoniadigusto.DTO;

import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
        String paymentMethod
    ) {}

    public record OrderItemResponse(
        Long id, 
        Long productId, 
        String productName, 
        Integer quantity, 
        BigDecimal price
    ) {}

    // Record esteso per includere tutti i dati di spedizione e pagamento
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
        List<OrderItemResponse> items
    ) {}
}