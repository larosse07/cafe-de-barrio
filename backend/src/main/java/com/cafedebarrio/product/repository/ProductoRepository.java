package com.cafedebarrio.product.repository;

import com.cafedebarrio.product.entity.Producto;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    @EntityGraph(attributePaths = "categoria")
    @Query("SELECT p FROM Producto p WHERE p.id = :id")
    Optional<Producto> findByIdWithCategoria(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria WHERE p.id = :id")
    Optional<Producto> findByIdForUpdate(@Param("id") Long id);

    @EntityGraph(attributePaths = "categoria")
    @Query("""
            SELECT p FROM Producto p
            WHERE (:incluirInactivos = true OR (p.activo = true AND p.categoria.activo = true))
              AND (:categoriaId IS NULL OR p.categoria.id = :categoriaId)
              AND (:disponible IS NULL OR (:disponible = true AND p.stock > 0) OR (:disponible = false AND p.stock = 0))
              AND (:search IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Producto> findFiltered(@Param("categoriaId") Long categoriaId,
                                @Param("disponible") Boolean disponible,
                                @Param("search") String search,
                                @Param("incluirInactivos") boolean incluirInactivos,
                                Pageable pageable);

    @EntityGraph(attributePaths = "categoria")
    List<Producto> findTop4ByCategoriaIdAndIdNotAndActivoTrueOrderByStockDesc(Long categoriaId, Long excludeId);

    boolean existsByCategoriaId(Long categoriaId);

    long countByCategoriaId(Long categoriaId);

    long countByActivoTrue();

    long countByActivoTrueAndStockLessThanEqual(Integer threshold);
}
