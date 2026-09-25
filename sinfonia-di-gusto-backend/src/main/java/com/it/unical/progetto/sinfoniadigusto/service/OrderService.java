package com.it.unical.progetto.sinfoniadigusto.service;

import java.math.BigDecimal;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
import com.it.unical.progetto.sinfoniadigusto.model.Coupon;
import com.it.unical.progetto.sinfoniadigusto.model.Order;
import com.it.unical.progetto.sinfoniadigusto.model.OrderItem;
import com.it.unical.progetto.sinfoniadigusto.model.OrderStatus;
import com.it.unical.progetto.sinfoniadigusto.model.Product;
import com.it.unical.progetto.sinfoniadigusto.repository.ClientUserRepository;
import com.it.unical.progetto.sinfoniadigusto.repository.OrderRepository;
import com.it.unical.progetto.sinfoniadigusto.repository.ProductRepository;

@Service
public class OrderService {

    // Stessa regola del checkout: gratis sopra 50 € di subtotale (prima dello sconto)
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("50.00");
    private static final BigDecimal SHIPPING_COST = new BigDecimal("4.90");

    // Flusso consentito degli stati dell'ordine
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            OrderStatus.PENDING, EnumSet.of(OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.CANCELLED),
            OrderStatus.PAID, EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
            OrderStatus.SHIPPED, EnumSet.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED),
            OrderStatus.DELIVERED, EnumSet.noneOf(OrderStatus.class),
            OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class)
    );

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ClientUserRepository userRepository;

    @Autowired
    private CouponService couponService;

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

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Prodotto non trovato con ID: " + itemReq.productId()));

            if (product.getStockQuantity() < itemReq.quantity()) {
                throw new BadRequestException("Quantità non disponibile in magazzino per il prodotto: " + product.getName());
            }

            product.setStockQuantity(product.getStockQuantity() - itemReq.quantity());
            productRepository.save(product);

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));
            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = new OrderItem(product, itemReq.quantity(), product.getPrice());
            order.addItem(orderItem);
        }

        // Codice sconto: validato e calcolato sempre dal server
        BigDecimal discount = BigDecimal.ZERO;

        if (request.couponCode() != null && !request.couponCode().isBlank()) {
            Coupon coupon = couponService.getUsableCoupon(request.couponCode(), subtotal);
            discount = couponService.calculateDiscount(coupon, subtotal);

            couponService.registerUsage(coupon);

            order.setCouponCode(coupon.getCode());
            order.setDiscountAmount(discount);
        }

        // Spedizione: calcolata sul subtotale prima dello sconto
        BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) > 0
                ? BigDecimal.ZERO
                : SHIPPING_COST;

        order.setShippingCost(shipping);

        // Totale da pagare = subtotale - sconto + spedizione
        order.setTotalAmount(subtotal.subtract(discount).add(shipping));

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

        OrderStatus oldStatus = order.getStatus();

        // Nessun cambiamento: niente da fare
        if (oldStatus == newStatus) {
            return mapToResponse(order);
        }

        if (!ALLOWED_TRANSITIONS.getOrDefault(oldStatus, Set.of()).contains(newStatus)) {
            throw new BadRequestException(
                    "Cambio di stato non consentito: da " + oldStatus + " a " + newStatus + ".");
        }

        // Annullamento: restituisce i pezzi al magazzino e l'utilizzo del codice sconto
        if (newStatus == OrderStatus.CANCELLED) {
            releaseOrderResources(order);
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        return mapToResponse(updated);
    }

    // Rimette in magazzino i prodotti dell'ordine e restituisce l'utilizzo del coupon
    private void releaseOrderResources(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        couponService.releaseUsage(order.getCouponCode());
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getProduct().getImageUrl()
                )).toList();

        // Subtotale ricalcolato dalle righe dell'ordine
        BigDecimal subtotal = order.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Sconto nullo per i vecchi ordini; spedizione null se non registrata
        BigDecimal discount = order.getDiscountAmount() != null
                ? order.getDiscountAmount()
                : BigDecimal.ZERO;

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
                itemResponses,
                order.getCouponCode(),
                discount,
                subtotal,
                order.getShippingCost()
        );
    }
}
