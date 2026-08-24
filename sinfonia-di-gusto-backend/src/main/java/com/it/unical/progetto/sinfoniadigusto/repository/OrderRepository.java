package com.it.unical.progetto.sinfoniadigusto.repository;

import com.it.unical.progetto.sinfoniadigusto.model.OrderStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; 

import com.it.unical.progetto.sinfoniadigusto.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
	// Lato Client: Storico ordini utente
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Lato Admin: Monitoraggio globale e filtraggio ordini per stato o per specifico cliente
    List<Order> findByStatusOrderByOrderDateDesc(OrderStatus status);

    List<Order> findAllByOrderByOrderDateDesc();

}
