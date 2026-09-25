package com.it.unical.progetto.sinfoniadigusto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.it.unical.progetto.sinfoniadigusto.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    boolean existsByName(String name);

    // Conteggio di tutte le categorie in una sola query (include quelle con 0 prodotti)
    @Query("""
           SELECT c.id AS categoryId, COUNT(p.id) AS total
           FROM Category c
           LEFT JOIN c.products p
           GROUP BY c.id
           """)
    List<CategoryProductCount> countProductsPerCategory();

    // Conteggio per una singola categoria
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId")
    long countProductsByCategoryId(@Param("categoryId") Long categoryId);

    interface CategoryProductCount {
        Long getCategoryId();
        Long getTotal();
    }
}