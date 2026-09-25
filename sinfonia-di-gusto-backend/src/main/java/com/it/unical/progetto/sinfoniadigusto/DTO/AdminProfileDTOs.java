package com.it.unical.progetto.sinfoniadigusto.DTO;

public class AdminProfileDTOs {
	
	public record UpdateProfilePayload(String name, String email) {}
	
	public record ChangePasswordPayload (String currentPassword, String NewPassword){}

}
