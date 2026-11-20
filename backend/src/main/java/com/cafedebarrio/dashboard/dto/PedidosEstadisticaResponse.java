package com.cafedebarrio.dashboard.dto;

import java.util.List;

public record PedidosEstadisticaResponse(
        String periodo,
        long totalPedidos,
        List<EstadoConteo> porEstado,
        List<PuntoPedido> serieDiaria
) {
    public record EstadoConteo(
            String estado,
            long cantidad
    ) {
    }

    public record PuntoPedido(
            String fecha,
            long total,
            long entregados,
            long cancelados
    ) {
    }
}
