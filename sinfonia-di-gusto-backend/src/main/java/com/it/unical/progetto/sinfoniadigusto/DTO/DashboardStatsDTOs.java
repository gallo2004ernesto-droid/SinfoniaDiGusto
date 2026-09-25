package com.it.unical.progetto.sinfoniadigusto.DTO;


public class DashboardStatsDTOs {
	public record DashboardStatsResponse(
			long totalProducts,
		    long totalCategories,
		    long onSaleCount,
		    long featuredCount
		) {}
}
