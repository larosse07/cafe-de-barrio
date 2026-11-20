package com.cafedebarrio.product.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductoRequest(
        @NotBlank(message = "El nombre del producto es obligatorio")
        @Size(min = 2, max = 140, message = "El nombre debe tener entre 2 y 140 caracteres")
        String nombre,

        @NotBlank(message = "La descripción del producto es obligatoria")
        @Size(min = 10, max = 2000, message = "La descripción debe tener entre 10 y 2000 caracteres")
        String descripcion,

        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(value = "0.01", message = "El precio debe ser mayor a S/ 0.00")
        @Digits(integer = 8, fraction = 2, message = "El precio puede tener hasta 2 decimales")
        BigDecimal precio,

        @NotNull(message = "El stock es obligatorio")
        @Min(value = 0, message = "El stock no puede ser negativo")
        Integer stock,

        @NotBlank(message = "La URL de la imagen es obligatoria")
        @Size(max = 500, message = "La URL de la imagen no puede exceder 500 caracteres")
        @Pattern(regexp = "^(https?://|/).+", message = "La URL de la imagen debe comenzar con http://, https:// o /")
        String imagenUrl,

        @NotNull(message = "La categoría es obligatoria")
        Long categoriaId,

        Boolean activo
) {
}
