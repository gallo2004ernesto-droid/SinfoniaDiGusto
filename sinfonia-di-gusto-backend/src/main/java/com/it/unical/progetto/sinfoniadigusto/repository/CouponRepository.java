package com.it.unical.progetto.sinfoniadigusto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.it.unical.progetto.sinfoniadigusto.model.Coupon;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    List<Coupon> findAllByOrderByIdDesc();

    // Restituisce 1 se l'utilizzo è stato registrato, 0 se il limite è già raggiunto
    @Modifying
    @Query("UPDATE Coupon c SET c.usedCount = c.usedCount + 1 "
            + "WHERE c.id = :id AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)")
    int incrementUsage(@Param("id") Long id);

    // Restituisce un utilizzo quando un ordine viene annullato (mai sotto zero)
    @Modifying
    @Query("UPDATE Coupon c SET c.usedCount = c.usedCount - 1 "
            + "WHERE c.code = :code AND c.usedCount > 0")
    int decrementUsageByCode(@Param("code") String code);
}
