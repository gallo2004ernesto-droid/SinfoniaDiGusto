package com.it.unical.progetto.sinfoniadigusto.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.it.unical.progetto.sinfoniadigusto.model.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
	
	//sia client che admin
	List<Product> findByCategoryId(Long categoryId);
	
	List<Product> findByNameContainingIgnoreCase(String Keyword);
	
	// Utilizzato dall'Admin per la Dashboard di inventario (es. prodotti con scorta inferiore a X)
    List<Product> findByStockQuantityLessThanEqual(Integer threshold);
}
