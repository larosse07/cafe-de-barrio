package com.cafedebarrio.order.service;

import com.cafedebarrio.common.exception.BusinessException;
import com.cafedebarrio.common.exception.InsufficientStockException;
import com.cafedebarrio.common.exception.ResourceNotFoundException;
import com.cafedebarrio.common.response.PageResponse;
import com.cafedebarrio.common.util.OrderCodeGenerator;
import com.cafedebarrio.order.dto.ActualizarEstadoPedidoRequest;
import com.cafedebarrio.order.dto.CrearPedidoRequest;
import com.cafedebarrio.order.dto.DetallePedidoRequest;
import com.cafedebarrio.order.dto.PedidoResponse;
import com.cafedebarrio.order.entity.DetallePedido;
import com.cafedebarrio.order.entity.EstadoPedido;
import com.cafedebarrio.order.entity.HistorialEstadoPedido;
import com.cafedebarrio.order.entity.Pedido;
import com.cafedebarrio.order.mapper.PedidoMapper;
import com.cafedebarrio.order.repository.HistorialEstadoPedidoRepository;
import com.cafedebarrio.order.repository.PedidoRepository;
import com.cafedebarrio.product.entity.Producto;
import com.cafedebarrio.product.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final HistorialEstadoPedidoRepository historialRepository;
    private final ProductoRepository productoRepository;
    private final PedidoMapper pedidoMapper;

    @Transactional
    public PedidoResponse crearPedido(CrearPedidoRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new BusinessException("No se puede registrar un pedido vacío.");
        }

        // Consolidar cantidades por productoId y ordenar ascendentemente para evitar deadlocks en bloqueos pesimistas
        Map<Long, Integer> cantidadesPorProducto = new TreeMap<>();
        for (DetallePedidoRequest item : request.items()) {
            if (item.cantidad() == null || item.cantidad() <= 0) {
                throw new BusinessException("La cantidad de cada producto debe ser mayor a cero.");
            }
            cantidadesPorProducto.merge(item.productoId(), item.cantidad(), Integer::sum);
        }

        Pedido pedido = Pedido.builder()
                .codigo(generarCodigoUnico())
                .clienteNombre(request.clienteNombre().trim())
                .celular(request.celular().trim())
                .direccion(request.direccion().trim())
                .referencia(normalizeOptional(request.referencia()))
                .observaciones(normalizeOptional(request.observaciones()))
                .fecha(LocalDateTime.now())
                .estado(EstadoPedido.PENDIENTE)
                .stockDevuelto(false)
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal totalGeneral = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> entry : cantidadesPorProducto.entrySet()) {
            Long productoId = entry.getKey();
            int cantidad = entry.getValue();

            Producto producto = productoRepository.findByIdForUpdate(productoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + productoId));

            if (!Boolean.TRUE.equals(producto.getActivo()) || !Boolean.TRUE.equals(producto.getCategoria().getActivo())) {
                throw new BusinessException("El producto '" + producto.getNombre() + "' no está disponible para la venta.");
            }

            if (producto.getStock() < cantidad) {
                throw new InsufficientStockException(
                        "Stock insuficiente para '" + producto.getNombre() + "'. Disponible: " + producto.getStock()
                                + ", solicitado: " + cantidad + "."
                );
            }

            // Descuento atómico dentro de la transacción con bloqueo pesimista
            producto.setStock(producto.getStock() - cantidad);
            productoRepository.save(producto);

            // Precio histórico inmutable al momento de compra
            BigDecimal precioUnitario = producto.getPrecio();
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
            totalGeneral = totalGeneral.add(subtotal);

            DetallePedido detalle = DetallePedido.builder()
                    .producto(producto)
                    .cantidad(cantidad)
                    .precioUnitario(precioUnitario)
                    .subtotal(subtotal)
                    .build();
            pedido.addDetalle(detalle);
        }

        pedido.setTotal(totalGeneral);

        HistorialEstadoPedido historialInicial = HistorialEstadoPedido.builder()
                .estadoAnterior(null)
                .estadoNuevo(EstadoPedido.PENDIENTE)
                .fechaCambio(pedido.getFecha())
                .build();
        pedido.addHistorial(historialInicial);

        Pedido guardado = pedidoRepository.save(pedido);
        return pedidoMapper.toResponse(guardado, guardado.getHistorialEstados());
    }

    @Transactional(readOnly = true)
    public PageResponse<PedidoResponse> listar(
            EstadoPedido estado,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            String search,
            int page,
            int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "fecha"));

        LocalDateTime desdeDt = fechaDesde != null ? fechaDesde.atStartOfDay() : null;
        LocalDateTime hastaDt = fechaHasta != null ? fechaHasta.atTime(LocalTime.MAX) : null;
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();

        Page<Long> idPage = pedidoRepository.findFilteredIds(estado, desdeDt, hastaDt, normalizedSearch, pageable);
        if (idPage.isEmpty()) {
            return PageResponse.from(Page.empty(pageable));
        }

        List<Pedido> pedidos = pedidoRepository.findAllByIdInWithDetalles(idPage.getContent());
        Map<Long, Pedido> byId = pedidos.stream().collect(Collectors.toMap(Pedido::getId, Function.identity()));

        List<PedidoResponse> ordered = idPage.getContent().stream()
                .map(byId::get)
                .filter(Objects::nonNull)
                .map(p -> pedidoMapper.toResponse(p, List.of()))
                .toList();

        Page<PedidoResponse> responsePage = new PageImpl<>(ordered, pageable, idPage.getTotalElements());
        return PageResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public PedidoResponse obtenerPorId(Long id) {
        Pedido pedido = pedidoRepository.findByIdWithDetalles(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + id));
        List<HistorialEstadoPedido> historial = historialRepository.findByPedidoIdOrderByFechaCambioAscIdAsc(id);
        return pedidoMapper.toResponse(pedido, historial);
    }

    @Transactional
    public PedidoResponse actualizarEstado(Long id, ActualizarEstadoPedidoRequest request) {
        Pedido pedido = pedidoRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + id));

        EstadoPedido estadoActual = pedido.getEstado();
        EstadoPedido nuevoEstado = request.estado();

        if (estadoActual == nuevoEstado) {
            throw new BusinessException("El pedido ya se encuentra en estado " + nuevoEstado + ".");
        }

        if (!estadoActual.canTransitionTo(nuevoEstado)) {
            throw new BusinessException(
                    "Transición de estado no permitida: no se puede cambiar de " + estadoActual + " a " + nuevoEstado + "."
            );
        }

        // Devolución de stock idempotente al cancelar un pedido válido
        if (nuevoEstado == EstadoPedido.CANCELADO && !Boolean.TRUE.equals(pedido.getStockDevuelto())) {
            List<DetallePedido> detallesOrdenados = pedido.getDetalles().stream()
                    .sorted(Comparator.comparing(d -> d.getProducto().getId()))
                    .toList();

            for (DetallePedido detalle : detallesOrdenados) {
                Producto producto = productoRepository.findByIdForUpdate(detalle.getProducto().getId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Producto no encontrado al revertir stock: ID " + detalle.getProducto().getId()));
                producto.setStock(producto.getStock() + detalle.getCantidad());
                productoRepository.save(producto);
            }
            pedido.setStockDevuelto(true);
        }

        pedido.setEstado(nuevoEstado);

        HistorialEstadoPedido cambio = HistorialEstadoPedido.builder()
                .pedido(pedido)
                .estadoAnterior(estadoActual)
                .estadoNuevo(nuevoEstado)
                .fechaCambio(LocalDateTime.now())
                .build();
        historialRepository.save(cambio);

        Pedido actualizado = pedidoRepository.save(pedido);
        List<HistorialEstadoPedido> historial = historialRepository.findByPedidoIdOrderByFechaCambioAscIdAsc(id);
        return pedidoMapper.toResponse(actualizado, historial);
    }

    private String generarCodigoUnico() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String code = OrderCodeGenerator.generate();
            if (!pedidoRepository.existsByCodigo(code)) {
                return code;
            }
        }
        return "CB-" + System.currentTimeMillis();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
