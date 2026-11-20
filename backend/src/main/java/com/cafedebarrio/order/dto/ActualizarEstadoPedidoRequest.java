package com.cafedebarrio.order.dto;

import com.cafedebarrio.order.entity.EstadoPedido;
import jakarta.validation.constraints.NotNull;

public record ActualizarEstadoPedidoRequest(
        @NotNull(message = "El nuevo estado es obligatorio")
        EstadoPedido estado
) {
}
