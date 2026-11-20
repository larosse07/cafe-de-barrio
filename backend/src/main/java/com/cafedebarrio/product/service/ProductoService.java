package com.cafedebarrio.product.service;

import com.cafedebarrio.category.entity.Categoria;
import com.cafedebarrio.category.repository.CategoriaRepository;
import com.cafedebarrio.common.exception.BusinessException;
import com.cafedebarrio.common.exception.ResourceNotFoundException;
import com.cafedebarrio.common.response.PageResponse;
import com.cafedebarrio.product.dto.ProductoRequest;
import com.cafedebarrio.product.dto.ProductoResponse;
import com.cafedebarrio.product.entity.Producto;
import com.cafedebarrio.product.mapper.ProductoMapper;
import com.cafedebarrio.product.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "nombre", "precio", "stock", "fechaCreacion");

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoMapper productoMapper;

    @Transactional(readOnly = true)
    public PageResponse<ProductoResponse> listar(
            Long categoriaId,
            Boolean disponible,
            String search,
            boolean incluirInactivos,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        String field = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "fechaCreacion";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(direction, field));

        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        Page<ProductoResponse> result = productoRepository
                .findFiltered(categoriaId, disponible, normalizedSearch, incluirInactivos, pageable)
                .map(productoMapper::toResponse);

        return PageResponse.from(result);
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerPorId(Long id, boolean incluirInactivos) {
        Producto producto = productoRepository.findByIdWithCategoria(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        if (!incluirInactivos && (!Boolean.TRUE.equals(producto.getActivo()) || !Boolean.TRUE.equals(producto.getCategoria().getActivo()))) {
            throw new ResourceNotFoundException("Producto no disponible con ID: " + id);
        }

        return productoMapper.toResponse(producto);
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        validarReglasNegocio(request);
        Categoria categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + request.categoriaId()));

        Producto nuevo = productoMapper.toEntity(request, categoria);
        Producto guardado = productoRepository.save(nuevo);
        return productoMapper.toResponse(guardado);
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        validarReglasNegocio(request);
        Producto producto = productoRepository.findByIdWithCategoria(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        Categoria categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + request.categoriaId()));

        productoMapper.updateEntity(producto, request, categoria);
        Producto actualizado = productoRepository.save(producto);
        return productoMapper.toResponse(actualizado);
    }

    @Transactional
    public void desactivar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    private void validarReglasNegocio(ProductoRequest request) {
        if (request.precio() == null || request.precio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("El precio del producto debe ser mayor a cero.");
        }
        if (request.stock() == null || request.stock() < 0) {
            throw new BusinessException("El stock del producto no puede ser negativo.");
        }
    }
}
