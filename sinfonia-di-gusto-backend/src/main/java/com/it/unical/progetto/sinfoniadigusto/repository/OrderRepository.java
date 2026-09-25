package com.it.unical.progetto.sinfoniadigusto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.it.unical.progetto.sinfoniadigusto.model.Order;
import com.it.unical.progetto.sinfoniadigusto.model.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
	// Lato Client: Storico ordini utente
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Lato Admin: Monitoraggio globale e filtraggio ordini per stato o per specifico cliente
    List<Order> findByStatusOrderByOrderDateDesc(OrderStatus status);

    List<Order> findAllByOrderByOrderDateDesc();

    boolean existsByUserId(Long userId);

}
