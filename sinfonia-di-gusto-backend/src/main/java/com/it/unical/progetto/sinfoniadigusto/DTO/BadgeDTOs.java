package com.it.unical.progetto.sinfoniadigusto.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BadgeDTOs {

    public record BadgeRequest(
            String name,
            String code,
            @JsonProperty("background_color") String backgroundColor,
            @JsonProperty("text_color") String textColor,
            String icon,
            @JsonProperty("is_active") Boolean active) {}

    public record BadgeResponse(
            Long id,
            String name,
            String code,
            @JsonProperty("background_color") String backgroundColor,
            @JsonProperty("text_color") String textColor,
            String icon,
            @JsonProperty("is_active") boolean active,
            @JsonProperty("is_system") boolean system) {}
}