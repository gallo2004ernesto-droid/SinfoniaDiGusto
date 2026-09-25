package com.it.unical.progetto.sinfoniadigusto.model;

import jakarta.persistence.*;

@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "background_color", nullable = false, length = 20)
    private String backgroundColor;

    @Column(name = "text_color", nullable = false, length = 20)
    private String textColor;

    private String icon;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    // Badge di sistema (In Evidenza, In Offerta): non eliminabili, codice fisso
    @Column(name = "is_system", nullable = false, columnDefinition = "boolean default false")
    private boolean system = false;

    public Badge() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getBackgroundColor() { return backgroundColor; }
    public void setBackgroundColor(String backgroundColor) { this.backgroundColor = backgroundColor; }

    public String getTextColor() { return textColor; }
    public void setTextColor(String textColor) { this.textColor = textColor; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isSystem() { return system; }
    public void setSystem(boolean system) { this.system = system; }
}