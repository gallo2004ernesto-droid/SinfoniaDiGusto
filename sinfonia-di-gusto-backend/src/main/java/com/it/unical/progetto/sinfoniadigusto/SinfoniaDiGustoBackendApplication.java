package com.it.unical.progetto.sinfoniadigusto;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SinfoniaDiGustoBackendApplication {

	public static void main(String[] args) {
		// Tutti gli orari (ordini, scadenze dei codici sconto) seguono l'ora italiana
		TimeZone.setDefault(TimeZone.getTimeZone("Europe/Rome"));
		SpringApplication.run(SinfoniaDiGustoBackendApplication.class, args);
	}

}
