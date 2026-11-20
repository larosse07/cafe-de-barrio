package com.cafedebarrio.order.repository;

import com.cafedebarrio.order.entity.EstadoPedido;
import com.cafedebarrio.order.entity.Pedido;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    boolean existsByCodigo(String codigo);

    @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
    @Query("SELECT p FROM Pedido p WHERE p.id = :id")
    Optional<Pedido> findByIdWithDetalles(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pedido p LEFT JOIN FETCH p.detalles d LEFT JOIN FETCH d.producto WHERE p.id = :id")
    Optional<Pedido> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            SELECT p.id FROM Pedido p
            WHERE (:estado IS NULL OR p.estado = :estado)
              AND (:fechaDesde IS NULL OR p.fecha >= :fechaDesde)
              AND (:fechaHasta IS NULL OR p.fecha <= :fechaHasta)
              AND (:search IS NULL OR LOWER(p.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.clienteNombre) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.celular) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Long> findFilteredIds(@Param("estado") EstadoPedido estado,
                               @Param("fechaDesde") LocalDateTime fechaDesde,
                               @Param("fechaHasta") LocalDateTime fechaHasta,
                               @Param("search") String search,
                               Pageable pageable);

    @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
    @Query("SELECT DISTINCT p FROM Pedido p WHERE p.id IN :ids")
    List<Pedido> findAllByIdInWithDetalles(@Param("ids") List<Long> ids);

    long countByEstado(EstadoPedido estado);

    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p WHERE p.estado <> com.cafedebarrio.order.entity.EstadoPedido.CANCELADO")
    BigDecimal sumVentasRegistradas();

    @Query("""
            SELECT p FROM Pedido p
            WHERE (:desde IS NULL OR p.fecha >= :desde)
            ORDER BY p.fecha ASC
            """)
    List<Pedido> findAllSince(@Param("desde") LocalDateTime desde);
}
