package com.it.unical.progetto.sinfoniadigusto.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.it.unical.progetto.sinfoniadigusto.model.ClientUser;
import com.it.unical.progetto.sinfoniadigusto.model.Role;

@Repository
public interface ClientUserRepository extends JpaRepository<ClientUser, Long> {
	
	Optional<ClientUser> findByEmail(String email);
	
	boolean existsByEmail(String email);
	
	//metodi dedicati all'admin
	
	List<ClientUser> findByRole(Role role);
	
	List<ClientUser> findByLastNameContainingIgnoreCaseOrFirstNameContainingIgnoreCase(String lastName, String firstName);
	
}
