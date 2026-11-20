package com.cafedebarrio.order.repository;

import com.cafedebarrio.order.entity.HistorialEstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialEstadoPedidoRepository extends JpaRepository<HistorialEstadoPedido, Long> {
    List<HistorialEstadoPedido> findByPedidoIdOrderByFechaCambioAscIdAsc(Long pedidoId);
}
