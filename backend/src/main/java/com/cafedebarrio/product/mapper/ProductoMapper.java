package com.cafedebarrio.product.mapper;

import com.cafedebarrio.category.entity.Categoria;
import com.cafedebarrio.product.dto.ProductoRequest;
import com.cafedebarrio.product.dto.ProductoResponse;
import com.cafedebarrio.product.entity.Producto;
import org.springframework.stereotype.Component;

@Component
public class ProductoMapper {

    public ProductoResponse toResponse(Producto entity) {
        boolean isAvailable = Boolean.TRUE.equals(entity.getActivo())
                && entity.getStock() != null
                && entity.getStock() > 0;
        return new ProductoResponse(
                entity.getId(),
                entity.getNombre(),
                entity.getDescripcion(),
                entity.getPrecio(),
                entity.getStock(),
                entity.getImagenUrl(),
                entity.getActivo(),
                isAvailable,
                entity.getCategoria().getId(),
                entity.getCategoria().getNombre(),
                entity.getFechaCreacion(),
                entity.getFechaActualizacion()
        );
    }

    public Producto toEntity(ProductoRequest request, Categoria categoria) {
        return Producto.builder()
                .nombre(request.nombre().trim())
                .descripcion(request.descripcion().trim())
                .precio(request.precio())
                .stock(request.stock())
                .imagenUrl(request.imagenUrl().trim())
                .activo(request.activo() != null ? request.activo() : true)
                .categoria(categoria)
                .build();
    }

    public void updateEntity(Producto entity, ProductoRequest request, Categoria categoria) {
        entity.setNombre(request.nombre().trim());
        entity.setDescripcion(request.descripcion().trim());
        entity.setPrecio(request.precio());
        entity.setStock(request.stock());
        entity.setImagenUrl(request.imagenUrl().trim());
        entity.setCategoria(categoria);
        if (request.activo() != null) {
            entity.setActivo(request.activo());
        }
    }
}
