package com.cafedebarrio.order.dto;

import com.cafedebarrio.order.entity.EstadoPedido;

import java.time.LocalDateTime;

public record HistorialEstadoResponse(
        Long id,
        EstadoPedido estadoAnterior,
        EstadoPedido estadoNuevo,
        LocalDateTime fechaCambio
) {
}
