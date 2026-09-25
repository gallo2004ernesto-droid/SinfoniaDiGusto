package com.it.unical.progetto.sinfoniadigusto.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.it.unical.progetto.sinfoniadigusto.DTO.CategoryDTOs.AdminCategoryResponse;
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

    // ---------- Pubblico: senza conteggio ----------

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> new CategoryResponse(
                        cat.getId(),
                        cat.getName(),
                        cat.getImageUrl()))
                .toList();
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria non trovata con ID: " + id));
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getImageUrl());
    }

    // ---------- Solo admin: con conteggio ----------

    public List<AdminCategoryResponse> getAllCategoriesForAdmin() {
        Map<Long, Long> counts = categoryRepository.countProductsPerCategory().stream()
                .collect(Collectors.toMap(
                        CategoryRepository.CategoryProductCount::getCategoryId,
                        CategoryRepository.CategoryProductCount::getTotal));

        return categoryRepository.findAll().stream()
                .map(cat -> new AdminCategoryResponse(
                        cat.getId(),
                        cat.getName(),
                        cat.getImageUrl(),
                        counts.getOrDefault(cat.getId(), 0L)))
                .toList();
    }

    // ---------- Scrittura ----------

    @Transactional
    public CategoryResponse createCategory(
            CategoryRequest request,
            MultipartFile imageFile) {

        if (categoryRepository.existsByName(request.name())) {
            throw new BadRequestException("Esiste già una categoria con questo nome.");
        }

        Category category = new Category();
        category.setName(request.name());

        if (imageFile != null && !imageFile.isEmpty()) {
            category.setImageUrl(fileStorageService.storeFile(imageFile));
        } else {
            // Fallback: eventuale URL passato dal frontend
            category.setImageUrl(request.imgeUrl());
        }

        Category saved = categoryRepository.save(category);

        return new CategoryResponse(
                saved.getId(),
                saved.getName(),
                saved.getImageUrl());
    }

    @Transactional
    public CategoryResponse updateCategory(
            Long id,
            CategoryRequest request,
            MultipartFile imageFile) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria non trovata con ID: " + id));

        if (!category.getName().equalsIgnoreCase(request.name())
                && categoryRepository.existsByName(request.name())) {
            throw new BadRequestException("Esiste già un'altra categoria con questo nome.");
        }

        category.setName(request.name());

        // Se arriva una nuova immagine sostituisce la vecchia,
        // altrimenti imageUrl resta invariato.
        if (imageFile != null && !imageFile.isEmpty()) {
            category.setImageUrl(fileStorageService.storeFile(imageFile));
        }

        Category updated = categoryRepository.save(category);

        return new CategoryResponse(
                updated.getId(),
                updated.getName(),
                updated.getImageUrl());
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Categoria non trovata con ID: " + id);
        }
        if (categoryRepository.countProductsByCategoryId(id) > 0) {
            throw new BadRequestException(
                    "Impossibile eliminare la categoria: contiene ancora dei prodotti.");
        }
        categoryRepository.deleteById(id);
    }
}