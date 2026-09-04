package com.it.unical.progetto.sinfoniadigusto.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.it.unical.progetto.sinfoniadigusto.DTO.OrderDTOs.CreateOrderRequest;
import com.it.unical.progetto.sinfoniadigusto.DTO.OrderDTOs.OrderItemRequest;
import com.it.unical.progetto.sinfoniadigusto.DTO.OrderDTOs.OrderItemResponse;
import com.it.unical.progetto.sinfoniadigusto.DTO.OrderDTOs.OrderResponse;
import com.it.unical.progetto.sinfoniadigusto.exception.BadRequestException;
import com.it.unical.progetto.sinfoniadigusto.exception.ResourceNotFoundException;
import com.it.unical.progetto.sinfoniadigusto.model.ClientUser;
import com.it.unical.progetto.sinfoniadigusto.model.Order;
import com.it.unical.progetto.sinfoniadigusto.model.OrderItem;
import com.it.unical.progetto.sinfoniadigusto.model.OrderStatus;
import com.it.unical.progetto.sinfoniadigusto.model.Product;
import com.it.unical.progetto.sinfoniadigusto.repository.ClientUserRepository;
import com.it.unical.progetto.sinfoniadigusto.repository.OrderRepository;
import com.it.unical.progetto.sinfoniadigusto.repository.ProductRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ClientUserRepository userRepository;

    @Transactional
    public OrderResponse createOrder(String userEmail, CreateOrderRequest request) {
        ClientUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato con email: " + userEmail));

        if (request.items() == null || request.items().isEmpty()) {
            throw new BadRequestException("L'ordine non contiene alcun prodotto.");
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);

        // Salvataggio dei dettagli di spedizione presi dalla request
        order.setFirstName(request.firstName());
        order.setLastName(request.lastName());
        order.setPhone(request.phone());
        order.setAddress(request.address());
        order.setCity(request.city());
        order.setPostalCode(request.postalCode());
        order.setNotes(request.notes());
        order.setPaymentMethod(request.paymentMethod());

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Prodotto non trovato con ID: " + itemReq.productId()));

            if (product.getStockQuantity() < itemReq.quantity()) {
                throw new BadRequestException("Quantità non disponibile in magazzino per il prodotto: " + product.getName());
            }

            product.setStockQuantity(product.getStockQuantity() - itemReq.quantity());
            productRepository.save(product);

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem orderItem = new OrderItem(product, itemReq.quantity(), product.getPrice());
            order.addItem(orderItem);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    public OrderResponse getOrderById(Long orderId, String userEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordine non trovato con ID: " + orderId));

        if (!order.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("Non sei autorizzato a visualizzare questo ordine.");
        }

        return mapToResponse(order);
    }

    public List<OrderResponse> getUserOrders(String userEmail) {
        ClientUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato"));

        return orderRepository.findByUserIdOrderByOrderDateDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<OrderResponse> getAllOrdersForAdmin() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatusOrderByOrderDateDesc(status).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordine non trovato con ID: " + orderId));

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        return mapToResponse(updated);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getPrice()
                )).toList();

        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getEmail(),
                order.getOrderDate(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getFirstName(),
                order.getLastName(),
                order.getPhone(),
                order.getAddress(),
                order.getCity(),
                order.getPostalCode(),
                order.getNotes(),
                order.getPaymentMethod(),
                itemResponses
        );
    }
}
