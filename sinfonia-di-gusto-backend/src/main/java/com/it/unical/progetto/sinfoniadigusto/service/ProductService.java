package com.it.unical.progetto.sinfoniadigusto.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.it.unical.progetto.sinfoniadigusto.DTO.ProductDTOs.ProductRequest;
import com.it.unical.progetto.sinfoniadigusto.DTO.ProductDTOs.ProductResponse;
import com.it.unical.progetto.sinfoniadigusto.exception.ResourceNotFoundException;
import com.it.unical.progetto.sinfoniadigusto.model.Category;
import com.it.unical.progetto.sinfoniadigusto.model.Product;
import com.it.unical.progetto.sinfoniadigusto.repository.CategoryRepository;
import com.it.unical.progetto.sinfoniadigusto.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // =========================================================
    // GET ALL
    // =========================================================
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET BY ID
    // =========================================================
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(()
                        -> new ResourceNotFoundException(
                                "Prodotto non trovato con ID: " + id
                        )
                );

        return mapToResponse(product);
    }

    // =========================================================
    // GET BY CATEGORY
    // =========================================================
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {

        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // SEARCH
    // =========================================================
    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String keyword) {

        return productRepository
                .findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // LOW STOCK
    // =========================================================
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts(Integer threshold) {

        return productRepository
                .findByStockQuantityLessThanEqual(threshold)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // CREATE
    // =========================================================
    @Transactional
    public ProductResponse createProduct(ProductRequest request, MultipartFile imageFile, MultipartFile pdfFile) {

        // Recupera la categoria tramite ID
        Category category = categoryRepository
                .findById(request.categoryId())
                .orElseThrow(()
                        -> new ResourceNotFoundException(
                                "Categoria non trovata con ID: "
                                + request.categoryId()
                        )
                );

        Product product = new Product();

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());

        // Il DB richiede stockQuantity NOT NULL
        product.setStockQuantity(
                request.stockQuantity() != null
                ? request.stockQuantity()
                : 0
        );

        // Gestione file Immagine
        if (imageFile != null && !imageFile.isEmpty()) {
            String savedImagePath = fileStorageService.storeFile(imageFile); // Salva il file e restituisce il path/url
            product.setImageUrl(savedImagePath);
        } else {
            product.setImageUrl(request.imageUrl()); // Fallback se viene passato un URL stringa
        }

        // Prezzo originale
        product.setOriginalPrice(
                request.originalPrice()
        );

        // Offerta
        product.setIsOffer(
                request.isOffer() != null
                ? request.isOffer()
                : false
        );

        // Percentuale sconto
        product.setDiscountPercent(
                request.discountPercent()
        );

        // Prodotto in evidenza
        product.setFeatured(
                request.featured() != null
                ? request.featured()
                : false
        );

        // Colore background
        product.setBgColor(
                request.bgColor()
        );

        // Gestione file PDF (Scheda Tecnica)
        if (pdfFile != null && !pdfFile.isEmpty()) {
            String savedPdfPath = fileStorageService.storeFile(pdfFile); // Salva il file PDF sul server
            product.setPdfUrl(savedPdfPath);
        } else {
            product.setPdfUrl(request.pdfUrl()); // Fallback se viene passato un URL stringa
        }

        // Categoria
        product.setCategory(category);

        Product saved = productRepository.save(product);

        return mapToResponse(saved);
    }

    // =========================================================
    // UPDATE
    // =========================================================
    @Transactional
    public ProductResponse updateProduct(
            Long id,
            ProductRequest request,
            MultipartFile imageFile,
            MultipartFile pdfFile
    ) {

        Product product = productRepository.findById(id)
                .orElseThrow(()
                        -> new ResourceNotFoundException(
                                "Prodotto non trovato con ID: " + id
                        )
                );

        // =========================================================
        // CATEGORIA
        // =========================================================
        Category category = categoryRepository
                .findById(request.categoryId())
                .orElseThrow(()
                        -> new ResourceNotFoundException(
                                "Categoria non trovata con ID: "
                                + request.categoryId()
                        )
                );

        // =========================================================
        // DATI PRINCIPALI
        // =========================================================
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());

        product.setStockQuantity(
                request.stockQuantity() != null
                ? request.stockQuantity()
                : 0
        );

        // =========================================================
        // PREZZO ORIGINALE
        // =========================================================
        product.setOriginalPrice(
                request.originalPrice()
        );

        // =========================================================
        // OFFERTA
        // =========================================================
        product.setIsOffer(
                request.isOffer() != null
                ? request.isOffer()
                : false
        );

        // =========================================================
        // SCONTO
        // =========================================================
        product.setDiscountPercent(
                request.discountPercent()
        );

        // =========================================================
        // FEATURED
        // =========================================================
        product.setFeatured(
                request.featured() != null
                ? request.featured()
                : false
        );

        // =========================================================
        // BACKGROUND COLOR
        // =========================================================
        product.setBgColor(
                request.bgColor()
        );

        // =========================================================
        // IMMAGINE
        // =========================================================
        if (imageFile != null && !imageFile.isEmpty()) {

            String savedImagePath
                    = fileStorageService.storeFile(imageFile);

            product.setImageUrl(savedImagePath);
        }

        // =========================================================
        // PDF
        // =========================================================
        if (pdfFile != null && !pdfFile.isEmpty()) {

            String savedPdfPath
                    = fileStorageService.storeFile(pdfFile);

            product.setPdfUrl(savedPdfPath);
        }

        // =========================================================
        // CATEGORIA
        // =========================================================
        product.setCategory(category);

        // =========================================================
        // SALVATAGGIO
        // =========================================================
        Product updated = productRepository.save(product);

        return mapToResponse(updated);
    }

    // =========================================================
    // DELETE
    // =========================================================
    @Transactional
    public void deleteProduct(Long id) {

        if (!productRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Prodotto non trovato con ID: " + id
            );
        }

        productRepository.deleteById(id);
    }

    // =========================================================
    // MAPPING ENTITY -> RESPONSE
    // =========================================================
    private ProductResponse mapToResponse(Product product) {

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getOriginalPrice(),
                product.getStockQuantity(),
                product.getIsOffer(),
                product.getDiscountPercent(),
                product.getFeatured(),
                product.getImageUrl(),
                product.getBgColor(),
                product.getPdfUrl(),
                product.getCategory().getId(),
                product.getCategory().getName()
        );
    }
}
