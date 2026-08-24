package com.it.unical.progetto.sinfoniadigusto.repository;

import com.it.unical.progetto.sinfoniadigusto.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminStatsProductRepository extends JpaRepository<Product, Long> {

    // Conteggio prodotti in offerta (flag isOffer o su prezzo scontato)
    @Query("SELECT COUNT(p) FROM Product p WHERE p.isOffer = true")
    long countOnSaleProducts();

    // Conteggio prodotti in evidenza
    @Query("SELECT COUNT(p) FROM Product p WHERE p.isFeatured = true")
    long countFeaturedProducts();
}