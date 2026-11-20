package com.cafedebarrio.order.dto;

import com.cafedebarrio.order.entity.EstadoPedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
        Long id,
        String codigo,
        String clienteNombre,
        String celular,
        String direccion,
        String referencia,
        String observaciones,
        LocalDateTime fecha,
        EstadoPedido estado,
        BigDecimal total,
        Boolean stockDevuelto,
        List<DetallePedidoResponse> detalles,
        List<HistorialEstadoResponse> historialEstados
) {
}
