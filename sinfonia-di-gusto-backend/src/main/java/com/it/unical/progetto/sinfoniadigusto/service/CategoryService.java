package com.it.unical.progetto.sinfoniadigusto.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.it.unical.progetto.sinfoniadigusto.DTO.CategoryDTOs.*;
import com.it.unical.progetto.sinfoniadigusto.DTO.CategoryDTOs.CategoryRequest;
import com.it.unical.progetto.sinfoniadigusto.DTO.CategoryDTOs.CategoryResponse;
import com.it.unical.progetto.sinfoniadigusto.exception.BadRequestException;
import com.it.unical.progetto.sinfoniadigusto.exception.ResourceNotFoundException;
import com.it.unical.progetto.sinfoniadigusto.model.Category;
import com.it.unical.progetto.sinfoniadigusto.repository.CategoryRepository;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> new CategoryResponse(cat.getId(), cat.getName(), cat.getImageUrl()))
                .toList();
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria non trovata con ID: " + id));
        return new CategoryResponse(category.getId(), category.getName(), category.getImageUrl());
    }

    @Transactional
    public CategoryResponse createCategory(
            CategoryRequest request,
            MultipartFile imageFile) {

        if (categoryRepository.existsByName(request.name())) {
            throw new BadRequestException(
                    "Esiste già una categoria con questo nome."
            );
        }

        Category category = new Category();

        category.setName(request.name());

        // Gestione immagine
        if (imageFile != null && !imageFile.isEmpty()) {

            String savedImagePath
                    = fileStorageService.storeFile(imageFile);

            category.setImageUrl(savedImagePath);

        } else {

            // Fallback: eventuale URL passato dal frontend
            category.setImageUrl(request.imgeUrl());
        }

        Category saved
                = categoryRepository.save(category);

        return new CategoryResponse(
                saved.getId(),
                saved.getName(),
                saved.getImageUrl()
        );
    }

    @Transactional
    public CategoryResponse updateCategory(
            Long id,
            CategoryRequest request,
            MultipartFile imageFile) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(()
                        -> new ResourceNotFoundException(
                                "Categoria non trovata con ID: " + id
                        )
                );

        if (!category.getName().equalsIgnoreCase(request.name())
                && categoryRepository.existsByName(request.name())) {

            throw new BadRequestException(
                    "Esiste già un'altra categoria con questo nome."
            );
        }

        category.setName(request.name());

        // Se è stata selezionata una nuova immagine,
        // la salviamo e sostituiamo quella precedente.
        if (imageFile != null && !imageFile.isEmpty()) {

            String savedImagePath
                    = fileStorageService.storeFile(imageFile);

            category.setImageUrl(savedImagePath);
        }

        // Se NON arriva una nuova immagine,
        // non tocchiamo category.imageUrl.
        // Quindi rimane quella vecchia.
        Category updated
                = categoryRepository.save(category);

        return new CategoryResponse(
                updated.getId(),
                updated.getName(),
                updated.getImageUrl()
        );
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Categoria non trovata con ID: " + id);
        }
        categoryRepository.deleteById(id);
    }

}
