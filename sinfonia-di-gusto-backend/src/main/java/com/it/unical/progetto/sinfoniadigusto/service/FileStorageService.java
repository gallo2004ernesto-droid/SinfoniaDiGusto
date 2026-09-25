package com.it.unical.progetto.sinfoniadigusto.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    // Cartella di destinazione locale sul server dove salvare i file
    private final Path uploadPath = Paths.get("uploads");

    public FileStorageService() {
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Impossibile creare la directory di upload", e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            // Genera un nome univoco per evitare sovrascritture
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path targetLocation = this.uploadPath.resolve(filename);
            
            Files.copy(file.getInputStream(), targetLocation);

            // Restituisce il percorso relativo/URL pubblico del file
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Errore durante il salvataggio del file: " + file.getOriginalFilename(), e);
        }
    }
}