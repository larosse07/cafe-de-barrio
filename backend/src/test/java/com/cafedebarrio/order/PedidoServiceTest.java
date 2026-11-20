package com.cafedebarrio.order;

import com.cafedebarrio.category.entity.Categoria;
import com.cafedebarrio.common.exception.BusinessException;
import com.cafedebarrio.common.exception.InsufficientStockException;
import com.cafedebarrio.order.dto.ActualizarEstadoPedidoRequest;
import com.cafedebarrio.order.dto.CrearPedidoRequest;
import com.cafedebarrio.order.dto.DetallePedidoRequest;
import com.cafedebarrio.order.dto.PedidoResponse;
import com.cafedebarrio.order.entity.DetallePedido;
import com.cafedebarrio.order.entity.EstadoPedido;
import com.cafedebarrio.order.entity.Pedido;
import com.cafedebarrio.order.mapper.PedidoMapper;
import com.cafedebarrio.order.repository.HistorialEstadoPedidoRepository;
import com.cafedebarrio.order.repository.PedidoRepository;
import com.cafedebarrio.order.service.PedidoService;
import com.cafedebarrio.product.entity.Producto;
import com.cafedebarrio.product.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private HistorialEstadoPedidoRepository historialRepository;

    @Mock
    private ProductoRepository productoRepository;

    private PedidoService pedidoService;

    @BeforeEach
    void setUp() {
        pedidoService = new PedidoService(pedidoRepository, historialRepository, productoRepository, new PedidoMapper());
    }

    @Test
    void crearPedido_debeCalcularTotalEnBackendYDescontarStock() {
        Categoria cat = Categoria.builder().id(1L).nombre("Café").activo(true).build();
        Producto prod = Producto.builder()
                .id(1L).nombre("Cajamarca 250g").precio(new BigDecimal("38.50")).stock(10)
                .imagenUrl("https://example.com/c.jpg").activo(true).categoria(cat).build();

        when(pedidoRepository.existsByCodigo(any())).thenReturn(false);
        when(productoRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(prod));
        when(productoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(pedidoRepository.save(any())).thenAnswer(inv -> {
            Pedido p = inv.getArgument(0);
            p.setId(100L);
            return p;
        });

        CrearPedidoRequest request = new CrearPedidoRequest(
                "Lucía Paredes", "987654321", "Av. Larco 450, Miraflores", "Frente al parque", null,
                List.of(new DetallePedidoRequest(1L, 3))
        );

        PedidoResponse response = pedidoService.crearPedido(request);

        assertThat(response.total()).isEqualByComparingTo("115.50");
        assertThat(response.estado()).isEqualTo(EstadoPedido.PENDIENTE);
        assertThat(prod.getStock()).isEqualTo(7);
        assertThat(response.detalles()).hasSize(1);
        assertThat(response.detalles().getFirst().precioUnitario()).isEqualByComparingTo("38.50");
    }

    @Test
    void crearPedido_debeRechazarSiStockEsInsuficiente() {
        Categoria cat = Categoria.builder().id(1L).nombre("Café").activo(true).build();
        Producto prod = Producto.builder()
                .id(1L).nombre("Cajamarca").precio(new BigDecimal("38.00")).stock(2)
                .imagenUrl("https://example.com/c.jpg").activo(true).categoria(cat).build();

        when(pedidoRepository.existsByCodigo(any())).thenReturn(false);
        when(productoRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(prod));

        CrearPedidoRequest request = new CrearPedidoRequest(
                "Carlos Ruiz", "999888777", "Calle Los Pinos 120", null, null,
                List.of(new DetallePedidoRequest(1L, 5))
        );

        assertThatThrownBy(() -> pedidoService.crearPedido(request))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Stock insuficiente");
    }

    @Test
    void crearPedido_debeRechazarProductoInactivo() {
        Categoria cat = Categoria.builder().id(1L).nombre("Café").activo(true).build();
        Producto prod = Producto.builder()
                .id(2L).nombre("Edición Agotada").precio(new BigDecimal("40.00")).stock(10)
                .imagenUrl("https://example.com/c.jpg").activo(false).categoria(cat).build();

        when(pedidoRepository.existsByCodigo(any())).thenReturn(false);
        when(productoRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(prod));

        CrearPedidoRequest request = new CrearPedidoRequest(
                "Carlos Ruiz", "999888777", "Calle Los Pinos 120", null, null,
                List.of(new DetallePedidoRequest(2L, 1))
        );

        assertThatThrownBy(() -> pedidoService.crearPedido(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("no está disponible");
    }

    @Test
    void actualizarEstado_cancelacionDebeDevolverStockUnaSolaVezYRechazarTransicionInvalida() {
        Categoria cat = Categoria.builder().id(1L).nombre("Café").activo(true).build();
        Producto prod = Producto.builder()
                .id(1L).nombre("Flat White").precio(new BigDecimal("14.50")).stock(5)
                .imagenUrl("https://example.com/fw.jpg").activo(true).categoria(cat).build();

        Pedido pedido = Pedido.builder()
                .id(50L).codigo("CB-20261120-ABCDE").clienteNombre("Ana").celular("987111222")
                .direccion("Jr. Unión 200").fecha(LocalDateTime.now())
                .estado(EstadoPedido.PENDIENTE).total(new BigDecimal("29.00")).stockDevuelto(false).build();
        pedido.addDetalle(DetallePedido.builder()
                .producto(prod).cantidad(2).precioUnitario(new BigDecimal("14.50")).subtotal(new BigDecimal("29.00")).build());

        when(pedidoRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(pedido));
        when(productoRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(prod));
        when(productoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(pedidoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(historialRepository.findByPedidoIdOrderByFechaCambioAscIdAsc(50L)).thenReturn(List.of());

        PedidoResponse cancelado = pedidoService.actualizarEstado(50L, new ActualizarEstadoPedidoRequest(EstadoPedido.CANCELADO));

        assertThat(cancelado.estado()).isEqualTo(EstadoPedido.CANCELADO);
        assertThat(cancelado.stockDevuelto()).isTrue();
        assertThat(prod.getStock()).isEqualTo(7);

        // Intentar transicionar un pedido cancelado debe fallar y no devolver stock de nuevo
        assertThatThrownBy(() -> pedidoService.actualizarEstado(50L, new ActualizarEstadoPedidoRequest(EstadoPedido.EN_PREPARACION)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Transición de estado no permitida");
        assertThat(prod.getStock()).isEqualTo(7);
    }
}
