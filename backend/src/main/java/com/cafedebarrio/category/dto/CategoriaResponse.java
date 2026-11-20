package com.cafedebarrio.category.dto;

public record CategoriaResponse(
        Long id,
        String nombre,
        String descripcion,
        Boolean activo,
        long cantidadProductos
) {
}
