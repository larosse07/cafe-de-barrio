package com.cafedebarrio.dashboard.dto;

import java.math.BigDecimal;

public record DashboardResumenResponse(
        long totalProductos,
        long productosActivos,
        long stockBajo,
        long totalPedidos,
        long pedidosPendientes,
        long pedidosEnPreparacion,
        long pedidosEntregados,
        long pedidosCancelados,
        BigDecimal ventasRegistradas
) {
}
