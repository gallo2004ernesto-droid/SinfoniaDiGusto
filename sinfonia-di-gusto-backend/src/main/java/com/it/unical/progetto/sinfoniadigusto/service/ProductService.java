package com.it.unical.progetto.sinfoniadigusto.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.it.unical.progetto.sinfoniadigusto.DTO.BadgeDTOs.BadgeResponse;
import com.it.unical.progetto.sinfoniadigusto.DTO.ProductDTOs.ProductRequest;
import com.it.unical.progetto.sinfoniadigusto.DTO.ProductDTOs.ProductResponse;
import com.it.unical.progetto.sinfoniadigusto.exception.BadRequestException;
import com.it.unical.progetto.sinfoniadigusto.exception.ResourceNotFoundException;
import com.it.unical.progetto.sinfoniadigusto.model.Badge;
import com.it.unical.progetto.sinfoniadigusto.model.Category;
import com.it.unical.progetto.sinfoniadigusto.model.Product;
import com.it.unical.progetto.sinfoniadigusto.repository.BadgeRepository;
import com.it.unical.progetto.sinfoniadigusto.repository.CategoryRepository;
import com.it.unical.progetto.sinfoniadigusto.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private FileStorageService fileStorageService;


    // GET ALL
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET BY ID
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

    // GET BY CATEGORY
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {

        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    
    // SEARCH
    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String keyword) {

        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }

        String term = keyword.trim();
        String lowerTerm = term.toLowerCase();

        return productRepository.search(term)
                .stream()
                .sorted(Comparator
                        .comparingInt((Product p) -> searchRank(p, lowerTerm))
                        .thenComparing(Product::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::mapToResponse)
                .toList();
    }

    // 0 = il nome inizia con la ricerca, 1 = il nome la contiene, 2 = solo descrizione o categoria
    private int searchRank(Product product, String lowerTerm) {
        String name = product.getName() == null ? "" : product.getName().toLowerCase();

        if (name.startsWith(lowerTerm)) {
            return 0;
        }
        if (name.contains(lowerTerm)) {
            return 1;
        }
        return 2;
    }

    
    // LOW STOCK
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts(Integer threshold) {

        return productRepository
                .findByStockQuantityLessThanEqual(threshold)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    
    // CREATE
    @Transactional
    public ProductResponse createProduct(
            ProductRequest request,
            MultipartFile imageFile,
            MultipartFile pdfFile
    ) {

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

        // Prezzo originale (usato solo se il prodotto è in offerta)
        product.setOriginalPrice(request.originalPrice());

        // Colore background
        product.setBgColor(request.bgColor());

        // Gestione file Immagine
        if (imageFile != null && !imageFile.isEmpty()) {
            String savedImagePath = fileStorageService.storeFile(imageFile);
            product.setImageUrl(savedImagePath);
        } else {
            product.setImageUrl(request.imageUrl()); // Fallback se viene passato un URL stringa
        }

        // Gestione file PDF (Scheda Tecnica)
        if (pdfFile != null && !pdfFile.isEmpty()) {
            String savedPdfPath = fileStorageService.storeFile(pdfFile);
            product.setPdfUrl(savedPdfPath);
        } else {
            product.setPdfUrl(request.pdfUrl()); // Fallback se viene passato un URL stringa
        }

        // Categoria
        product.setCategory(category);

        // Badge, flag derivati e sconto calcolato
        applyBadges(product, request.badgeIds());
        syncFlagsFromBadges(product);
        applyPricing(product);

        Product saved = productRepository.save(product);

        return mapToResponse(saved);
    }

    
    // UPDATE
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

        // Categoria
        Category category = categoryRepository
                .findById(request.categoryId())
                .orElseThrow(()
                        -> new ResourceNotFoundException(
                                "Categoria non trovata con ID: "
                                + request.categoryId()
                        )
                );

        // Dati principali
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());

        product.setStockQuantity(
                request.stockQuantity() != null
                ? request.stockQuantity()
                : 0
        );

        // Prezzo originale (usato solo se il prodotto è in offerta)
        product.setOriginalPrice(request.originalPrice());

        // Colore background
        product.setBgColor(request.bgColor());

        // Immagine (se non ne arriva una nuova resta quella attuale)
        if (imageFile != null && !imageFile.isEmpty()) {
            String savedImagePath = fileStorageService.storeFile(imageFile);
            product.setImageUrl(savedImagePath);
        }

        // PDF (se non ne arriva uno nuovo resta quello attuale)
        if (pdfFile != null && !pdfFile.isEmpty()) {
            String savedPdfPath = fileStorageService.storeFile(pdfFile);
            product.setPdfUrl(savedPdfPath);
        }

        // Categoria
        product.setCategory(category);

        // Badge, flag derivati e sconto calcolato
        applyBadges(product, request.badgeIds());
        syncFlagsFromBadges(product);
        applyPricing(product);

        Product updated = productRepository.save(product);

        return mapToResponse(updated);
    }

    
    // DELETE
    @Transactional
    public void deleteProduct(Long id) {

        if (!productRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Prodotto non trovato con ID: " + id
            );
        }

        productRepository.deleteById(id);
    }

    
    // BADGE
    // badgeIds == null  -> i badge restano invariati
    // badgeIds vuota    -> tutti i badge vengono tolti
    private void applyBadges(Product product, List<Long> badgeIds) {

        if (badgeIds == null) {
            return;
        }

        Set<Long> ids = new HashSet<>(badgeIds);
        List<Badge> found = badgeRepository.findAllById(ids);

        if (found.size() != ids.size()) {
            throw new ResourceNotFoundException(
                    "Uno o più badge selezionati non esistono."
            );
        }

        product.getBadges().clear();
        product.getBadges().addAll(found);
    }

    // I flag isOffer e featured derivano dai badge di sistema assegnati
    private void syncFlagsFromBadges(Product product) {
        product.setIsOffer(hasBadge(product, BadgeService.CODE_OFFER));
        product.setFeatured(hasBadge(product, BadgeService.CODE_FEATURED));
    }

    private boolean hasBadge(Product product, String code) {
        return product.getBadges().stream()
                .anyMatch(b -> code.equals(b.getCode()));
    }

    // PREZZI E SCONTO
    // Con il badge "In Offerta": prezzo originale obbligatorio (> prezzo),
    // sconto calcolato. Senza il badge: prezzo originale e sconto azzerati.
    private void applyPricing(Product product) {

        if (!hasBadge(product, BadgeService.CODE_OFFER)) {
            product.setOriginalPrice(null);
            product.setDiscountPercent(null);
            return;
        }

        BigDecimal price = product.getPrice();
        BigDecimal original = product.getOriginalPrice();

        if (price == null
                || original == null
                || original.compareTo(price) <= 0) {

            throw new BadRequestException(
                    "Con il badge \"In Offerta\" il Prezzo originale deve essere maggiore del Prezzo."
            );
        }

        BigDecimal discount = original.subtract(price)
                .multiply(BigDecimal.valueOf(100))
                .divide(original, 0, RoundingMode.HALF_UP);

        product.setDiscountPercent(discount.intValue());
    }

    
    // MAPPING ENTITY -> RESPONSE
    private ProductResponse mapToResponse(Product product) {

        List<BadgeResponse> badges = product.getBadges().stream()
                .sorted(Comparator.comparing(Badge::getName))
                .map(BadgeService::toResponse)
                .toList();

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
                product.getCategory().getName(),
                badges
        );
    }
}
