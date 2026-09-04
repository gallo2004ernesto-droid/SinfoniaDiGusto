package com.it.unical.progetto.sinfoniadigusto.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.it.unical.progetto.sinfoniadigusto.DTO.CategoryDTOs.CategoryRequest;
import com.it.unical.progetto.sinfoniadigusto.DTO.CategoryDTOs.CategoryResponse;
import com.it.unical.progetto.sinfoniadigusto.service.CategoryService;



@RestController
@RequestMapping("/api/v1/categories") // Aggiunto lo slash iniziale "/"
@CrossOrigin(origins = "*")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(){
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id){
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)

    public ResponseEntity<CategoryResponse> createCategory(
            @RequestPart("category") CategoryRequest request,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        CategoryResponse response =
                categoryService.createCategory(request, imageFile);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    
    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestPart("category") CategoryRequest request,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        return ResponseEntity.ok(
                categoryService.updateCategory(
                        id,
                        request,
                        imageFile
                )
        );
    }


    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}