package com.it.unical.progetto.sinfoniadigusto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.it.unical.progetto.sinfoniadigusto.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Carica categoria e badge insieme, evitando una query per ogni prodotto
    @Override
    @EntityGraph(attributePaths = {"category", "badges"})
    List<Product> findAll();

    // Ricerca per nome, descrizione o categoria (senza distinzione tra maiuscole e minuscole)
    @EntityGraph(attributePaths = {"category", "badges"})
    @Query("""
           SELECT p FROM Product p
           WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
           """)
    List<Product> search(@Param("keyword") String keyword);

    // sia client che admin
    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByNameContainingIgnoreCase(String keyword);

    // Utilizzato dall'Admin per la Dashboard di inventario (es. prodotti con scorta inferiore a X)
    List<Product> findByStockQuantityLessThanEqual(Integer threshold);
}