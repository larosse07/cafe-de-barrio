package com.cafedebarrio.order.mapper;

import com.cafedebarrio.order.dto.DetallePedidoResponse;
import com.cafedebarrio.order.dto.HistorialEstadoResponse;
import com.cafedebarrio.order.dto.PedidoResponse;
import com.cafedebarrio.order.entity.DetallePedido;
import com.cafedebarrio.order.entity.HistorialEstadoPedido;
import com.cafedebarrio.order.entity.Pedido;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PedidoMapper {

    public PedidoResponse toResponse(Pedido pedido, List<HistorialEstadoPedido> historial) {
        List<DetallePedidoResponse> detalles = pedido.getDetalles().stream()
                .map(this::toDetalleResponse)
                .toList();

        List<HistorialEstadoResponse> historialDto = historial.stream()
                .map(this::toHistorialResponse)
                .toList();

        return new PedidoResponse(
                pedido.getId(),
                pedido.getCodigo(),
                pedido.getClienteNombre(),
                pedido.getCelular(),
                pedido.getDireccion(),
                pedido.getReferencia(),
                pedido.getObservaciones(),
                pedido.getFecha(),
                pedido.getEstado(),
                pedido.getTotal(),
                pedido.getStockDevuelto(),
                detalles,
                historialDto
        );
    }

    public DetallePedidoResponse toDetalleResponse(DetallePedido detalle) {
        return new DetallePedidoResponse(
                detalle.getId(),
                detalle.getProducto().getId(),
                detalle.getProducto().getNombre(),
                detalle.getProducto().getImagenUrl(),
                detalle.getCantidad(),
                detalle.getPrecioUnitario(),
                detalle.getSubtotal()
        );
    }

    public HistorialEstadoResponse toHistorialResponse(HistorialEstadoPedido h) {
        return new HistorialEstadoResponse(
                h.getId(),
                h.getEstadoAnterior(),
                h.getEstadoNuevo(),
                h.getFechaCambio()
        );
    }
}
