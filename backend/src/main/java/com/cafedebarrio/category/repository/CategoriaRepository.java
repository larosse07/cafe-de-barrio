package com.cafedebarrio.category.repository;

import com.cafedebarrio.category.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    @Query("""
            SELECT c FROM Categoria c
            WHERE (:incluirInactivos = true OR c.activo = true)
              AND (:search IS NULL OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(c.descripcion) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY c.nombre ASC
            """)
    List<Categoria> findFiltered(@Param("search") String search,
                                 @Param("incluirInactivos") boolean incluirInactivos);
}
