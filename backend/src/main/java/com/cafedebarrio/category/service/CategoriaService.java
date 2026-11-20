package com.cafedebarrio.category.service;

import com.cafedebarrio.category.dto.CategoriaRequest;
import com.cafedebarrio.category.dto.CategoriaResponse;
import com.cafedebarrio.category.entity.Categoria;
import com.cafedebarrio.category.mapper.CategoriaMapper;
import com.cafedebarrio.category.repository.CategoriaRepository;
import com.cafedebarrio.common.exception.ConflictException;
import com.cafedebarrio.common.exception.ResourceNotFoundException;
import com.cafedebarrio.product.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final CategoriaMapper categoriaMapper;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar(String search, boolean incluirInactivos) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        return categoriaRepository.findFiltered(normalizedSearch, incluirInactivos).stream()
                .map(c -> categoriaMapper.toResponse(c, productoRepository.countByCategoriaId(c.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse obtenerPorId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));
        return categoriaMapper.toResponse(categoria, productoRepository.countByCategoriaId(id));
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest request) {
        String nombre = request.nombre().trim();
        if (categoriaRepository.findByNombreIgnoreCase(nombre).isPresent()) {
            throw new ConflictException("Ya existe una categoría con el nombre '" + nombre + "'.");
        }
        Categoria guardada = categoriaRepository.save(categoriaMapper.toEntity(request));
        return categoriaMapper.toResponse(guardada, 0L);
    }

    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest request) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));

        String nombre = request.nombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new ConflictException("Ya existe otra categoría con el nombre '" + nombre + "'.");
        }

        categoriaMapper.updateEntity(categoria, request);
        Categoria actualizada = categoriaRepository.save(categoria);
        return categoriaMapper.toResponse(actualizada, productoRepository.countByCategoriaId(id));
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));

        if (productoRepository.existsByCategoriaId(id)) {
            throw new ConflictException("No se puede eliminar la categoría porque tiene productos asociados.");
        }

        categoriaRepository.delete(categoria);
    }
}
