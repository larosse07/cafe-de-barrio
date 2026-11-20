package com.cafedebarrio.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "El nombre de la categoría es obligatorio")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        String nombre,

        @NotBlank(message = "La descripción de la categoría es obligatoria")
        @Size(min = 5, max = 300, message = "La descripción debe tener entre 5 y 300 caracteres")
        String descripcion,

        Boolean activo
) {
}
