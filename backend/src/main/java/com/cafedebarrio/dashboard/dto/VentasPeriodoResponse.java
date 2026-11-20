package com.cafedebarrio.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public record VentasPeriodoResponse(
        String periodo,
        BigDecimal totalVentas,
        long cantidadPedidosValidos,
        BigDecimal ticketPromedio,
        List<PuntoVenta> serie
) {
    public record PuntoVenta(
            String fecha,
            BigDecimal monto,
            long pedidos
    ) {
    }
}
