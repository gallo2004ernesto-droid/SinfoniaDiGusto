package com.it.unical.progetto.sinfoniadigusto.DTO;

public class AuthDTOs {
	
	public record LoginRequest(String email, String password) {}
	
	public record RegisterRequest(String firstName, String lastName, String email, String password){}
	
	public record AuthResponse(String token, String email, String role, String firstName, String lastName) {}
	
	
}	
