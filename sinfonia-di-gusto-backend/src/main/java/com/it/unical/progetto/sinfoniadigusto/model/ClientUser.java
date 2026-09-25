package com.it.unical.progetto.sinfoniadigusto.model;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;

@Entity
@Table(name = "client_users")
public class ClientUser implements UserDetails {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String firstName;
	
	@Column(nullable = false)
	private String lastName;
	
	@Column(nullable = false, unique = true)
	private String email;
	
	@Column(nullable = false)
	private String password;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role = Role.ROLE_USER;
	
	@Column(nullable = false)
	private boolean active = true;
	
	@Column(nullable = false, updatable = false)
	private LocalDate registrationDate;
	
	@PrePersist
	protected void onCreate() {
		if(this.registrationDate == null) {
			this.registrationDate = LocalDate.now();
		}
	}
	
	//costruttore
	public ClientUser() {}

    public ClientUser(String firstName, String lastName, String email, String password, Role role, boolean active) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.active = active;
    }
    
 // Metodi prescritti dall'interfaccia UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }

    // Getter e Setter
    public Long getId() { 
    	return id;
    }
    public void setId(Long id) {
    	this.id = id;
    }

    public String getFirstName() {
    	return firstName;
    }
    public void setFirstName(String firstName) {
    	this.firstName = firstName; 
    }

    public String getLastName() {
    	return lastName; 
    }
    public void setLastName(String lastName) {
    	this.lastName = lastName;
    }

    public String getEmail() { 
    	return email; 
    }
    public void setEmail(String email) { 
    	this.email = email; 
    }

    public void setPassword(String password) { 
    	this.password = password; 
    }

    public Role getRole() { 
    	return role; 
    }
    public void setRole(Role role) { 
    	this.role = role; 
    }

    public boolean isActive() {
    	return active; 
    }
    public void setActive(boolean active) {
    	this.active = active; 
    }

    public LocalDate getRegistrationDate() { 
    	return registrationDate;
    }
    public void setRegistrationDate(LocalDate registrationDate) {
    	this.registrationDate = registrationDate; 
    }
}
