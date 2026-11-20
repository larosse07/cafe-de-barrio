package com.cafedebarrio.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductoResponse(
        Long id,
        String nombre,
        String descripcion,
        BigDecimal precio,
        Integer stock,
        String imagenUrl,
        Boolean activo,
        boolean disponible,
        Long categoriaId,
        String categoriaNombre,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion
) {
}
