package com.it.unical.progetto.sinfoniadigusto.DTO;

public class CategoryDTOs {
	
	public record CategoryRequest(String name, String imgeUrl) {}
	
	public record CategoryResponse(Long id,String name,String imgeUrl) {}

}
