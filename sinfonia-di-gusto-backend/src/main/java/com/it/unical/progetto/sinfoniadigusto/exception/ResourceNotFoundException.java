//Eccezione lanciata quando un'entità richiesta (utente, prodotto, ordine) non viene trovata sul DB.

package com.it.unical.progetto.sinfoniadigusto.exception;

public class ResourceNotFoundException extends RuntimeException{
	
	public ResourceNotFoundException(String message) {
		super(message);
	}

}
