package com.it.unical.progetto.sinfoniadigusto.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @JsonIgnore
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Product> products = new ArrayList<>();
    
    // RIMOSSO nullable = false e unique = true per evitare il crash su salvataggio
    @Column(nullable = true)
    private String imageUrl;

    public Category() {}

    public Category(String name, String imageUrl) {
        this.name = name;
        this.imageUrl = imageUrl;
    }
    
    public void addProduct(Product product) {
        products.add(product);
        product.setCategory(this);
    }

    public void removeProduct(Product product) {
        products.remove(product);
        product.setCategory(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}