package com.it.unical.progetto.sinfoniadigusto.service;

import com.it.unical.progetto.sinfoniadigusto.DTO.DashboardStatsDTOs.DashboardStatsResponse;
import com.it.unical.progetto.sinfoniadigusto.repository.AdminStatsProductRepository;
import com.it.unical.progetto.sinfoniadigusto.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminStatsService {

    @Autowired
    private AdminStatsProductRepository adminStatsProductRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        long totalProducts = adminStatsProductRepository.count();
        long totalCategories = categoryRepository.count();
        long onSaleCount = adminStatsProductRepository.countOnSaleProducts();
        long featuredCount = adminStatsProductRepository.countFeaturedProducts();

        return new DashboardStatsResponse(
                totalProducts,
                totalCategories,
                onSaleCount,
                featuredCount
        );
    }
}