package com.cafedebarrio.dashboard.service;

import com.cafedebarrio.dashboard.dto.DashboardResumenResponse;
import com.cafedebarrio.dashboard.dto.PedidosEstadisticaResponse;
import com.cafedebarrio.dashboard.dto.VentasPeriodoResponse;
import com.cafedebarrio.order.entity.EstadoPedido;
import com.cafedebarrio.order.entity.Pedido;
import com.cafedebarrio.order.repository.PedidoRepository;
import com.cafedebarrio.product.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final int LOW_STOCK_THRESHOLD = 10;
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private final ProductoRepository productoRepository;
    private final PedidoRepository pedidoRepository;

    @Transactional(readOnly = true)
    public DashboardResumenResponse obtenerResumen() {
        long totalProductos = productoRepository.count();
        long productosActivos = productoRepository.countByActivoTrue();
        long stockBajo = productoRepository.countByActivoTrueAndStockLessThanEqual(LOW_STOCK_THRESHOLD);

        long totalPedidos = pedidoRepository.count();
        long pendientes = pedidoRepository.countByEstado(EstadoPedido.PENDIENTE);
        long enPreparacion = pedidoRepository.countByEstado(EstadoPedido.EN_PREPARACION);
        long entregados = pedidoRepository.countByEstado(EstadoPedido.ENTREGADO);
        long cancelados = pedidoRepository.countByEstado(EstadoPedido.CANCELADO);

        BigDecimal ventas = pedidoRepository.sumVentasRegistradas();
        if (ventas == null) {
            ventas = BigDecimal.ZERO;
        }

        return new DashboardResumenResponse(
                totalProductos,
                productosActivos,
                stockBajo,
                totalPedidos,
                pendientes,
                enPreparacion,
                entregados,
                cancelados,
                ventas
        );
    }

    @Transactional(readOnly = true)
    public VentasPeriodoResponse obtenerVentas(String periodo) {
        String normalizedPeriodo = normalizePeriodo(periodo);
        LocalDateTime desde = resolveStartDate(normalizedPeriodo);
        List<Pedido> pedidos = pedidoRepository.findAllSince(desde);

        Map<LocalDate, BigDecimal> montosPorDia = new TreeMap<>();
        Map<LocalDate, Long> conteoPorDia = new TreeMap<>();
        prefillDateRange(normalizedPeriodo, montosPorDia, conteoPorDia);

        BigDecimal totalVentas = BigDecimal.ZERO;
        long pedidosValidos = 0;

        for (Pedido pedido : pedidos) {
            if (pedido.getEstado() == EstadoPedido.CANCELADO) {
                continue;
            }
            LocalDate dia = pedido.getFecha().toLocalDate();
            montosPorDia.merge(dia, pedido.getTotal(), BigDecimal::add);
            conteoPorDia.merge(dia, 1L, Long::sum);
            totalVentas = totalVentas.add(pedido.getTotal());
            pedidosValidos++;
        }

        BigDecimal ticketPromedio = pedidosValidos > 0
                ? totalVentas.divide(BigDecimal.valueOf(pedidosValidos), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<VentasPeriodoResponse.PuntoVenta> serie = montosPorDia.entrySet().stream()
                .map(entry -> new VentasPeriodoResponse.PuntoVenta(
                        entry.getKey().format(ISO_DATE),
                        entry.getValue(),
                        conteoPorDia.getOrDefault(entry.getKey(), 0L)
                ))
                .toList();

        return new VentasPeriodoResponse(normalizedPeriodo, totalVentas, pedidosValidos, ticketPromedio, serie);
    }

    @Transactional(readOnly = true)
    public PedidosEstadisticaResponse obtenerPedidos(String periodo) {
        String normalizedPeriodo = normalizePeriodo(periodo);
        LocalDateTime desde = resolveStartDate(normalizedPeriodo);
        List<Pedido> pedidos = pedidoRepository.findAllSince(desde);

        Map<EstadoPedido, Long> conteoEstados = new EnumMap<>(EstadoPedido.class);
        for (EstadoPedido e : EstadoPedido.values()) {
            conteoEstados.put(e, 0L);
        }

        Map<LocalDate, long[]> serieMap = new TreeMap<>();
        if (!"all".equals(normalizedPeriodo)) {
            int days = daysForPeriodo(normalizedPeriodo);
            LocalDate today = LocalDate.now();
            for (int i = days - 1; i >= 0; i--) {
                serieMap.put(today.minusDays(i), new long[]{0L, 0L, 0L});
            }
        }

        for (Pedido p : pedidos) {
            conteoEstados.merge(p.getEstado(), 1L, Long::sum);
            LocalDate dia = p.getFecha().toLocalDate();
            long[] bucket = serieMap.computeIfAbsent(dia, k -> new long[]{0L, 0L, 0L});
            bucket[0]++;
            if (p.getEstado() == EstadoPedido.ENTREGADO) {
                bucket[1]++;
            } else if (p.getEstado() == EstadoPedido.CANCELADO) {
                bucket[2]++;
            }
        }

        List<PedidosEstadisticaResponse.EstadoConteo> porEstado = conteoEstados.entrySet().stream()
                .map(e -> new PedidosEstadisticaResponse.EstadoConteo(e.getKey().name(), e.getValue()))
                .toList();

        List<PedidosEstadisticaResponse.PuntoPedido> serieDiaria = serieMap.entrySet().stream()
                .map(e -> new PedidosEstadisticaResponse.PuntoPedido(
                        e.getKey().format(ISO_DATE),
                        e.getValue()[0],
                        e.getValue()[1],
                        e.getValue()[2]
                ))
                .toList();

        return new PedidosEstadisticaResponse(normalizedPeriodo, pedidos.size(), porEstado, serieDiaria);
    }

    private String normalizePeriodo(String periodo) {
        if (periodo == null) {
            return "30d";
        }
        return switch (periodo.trim().toLowerCase()) {
            case "7d", "30d", "90d", "all" -> periodo.trim().toLowerCase();
            default -> "30d";
        };
    }

    private int daysForPeriodo(String periodo) {
        return switch (periodo) {
            case "7d" -> 7;
            case "90d" -> 90;
            default -> 30;
        };
    }

    private LocalDateTime resolveStartDate(String periodo) {
        if ("all".equals(periodo)) {
            return null;
        }
        int days = daysForPeriodo(periodo);
        return LocalDate.now().minusDays(days - 1L).atStartOfDay();
    }

    private void prefillDateRange(String periodo, Map<LocalDate, BigDecimal> montos, Map<LocalDate, Long> conteos) {
        if ("all".equals(periodo)) {
            return;
        }
        int days = daysForPeriodo(periodo);
        LocalDate today = LocalDate.now();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            montos.put(day, BigDecimal.ZERO);
            conteos.put(day, 0L);
        }
    }
}
