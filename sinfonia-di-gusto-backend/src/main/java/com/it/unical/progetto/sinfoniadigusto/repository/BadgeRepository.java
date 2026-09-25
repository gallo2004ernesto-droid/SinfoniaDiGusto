package com.it.unical.progetto.sinfoniadigusto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.it.unical.progetto.sinfoniadigusto.model.Badge;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {

    Optional<Badge> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    List<Badge> findByActiveTrueOrderByNameAsc();

    List<Badge> findAllByOrderByNameAsc();

    // Quanti prodotti usano questo badge
    @Query("SELECT COUNT(p) FROM Product p JOIN p.badges b WHERE b.id = :badgeId")
    long countProductsUsingBadge(@Param("badgeId") Long badgeId);
}