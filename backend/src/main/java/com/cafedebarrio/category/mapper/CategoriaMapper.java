package com.cafedebarrio.category.mapper;

import com.cafedebarrio.category.dto.CategoriaRequest;
import com.cafedebarrio.category.dto.CategoriaResponse;
import com.cafedebarrio.category.entity.Categoria;
import org.springframework.stereotype.Component;

@Component
public class CategoriaMapper {

    public CategoriaResponse toResponse(Categoria entity, long cantidadProductos) {
        return new CategoriaResponse(
                entity.getId(),
                entity.getNombre(),
                entity.getDescripcion(),
                entity.getActivo(),
                cantidadProductos
        );
    }

    public Categoria toEntity(CategoriaRequest request) {
        return Categoria.builder()
                .nombre(request.nombre().trim())
                .descripcion(request.descripcion().trim())
                .activo(request.activo() != null ? request.activo() : true)
                .build();
    }

    public void updateEntity(Categoria entity, CategoriaRequest request) {
        entity.setNombre(request.nombre().trim());
        entity.setDescripcion(request.descripcion().trim());
        if (request.activo() != null) {
            entity.setActivo(request.activo());
        }
    }
}
