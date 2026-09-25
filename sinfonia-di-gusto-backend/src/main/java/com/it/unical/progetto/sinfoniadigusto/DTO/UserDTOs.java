package com.it.unical.progetto.sinfoniadigusto.DTO;

import com.it.unical.progetto.sinfoniadigusto.model.Role;

import java.time.LocalDate;

public class UserDTOs {
	
	public record UserProfileResponse(Long id, String firstName, String lastName, String email, Role role, Boolean active, LocalDate registrationDate) {}
}
