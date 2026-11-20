package com.cafedebarrio.order;

import com.cafedebarrio.category.entity.Categoria;
import com.cafedebarrio.category.repository.CategoriaRepository;
import com.cafedebarrio.order.dto.ActualizarEstadoPedidoRequest;
import com.cafedebarrio.order.dto.CrearPedidoRequest;
import com.cafedebarrio.order.dto.DetallePedidoRequest;
import com.cafedebarrio.order.dto.PedidoResponse;
import com.cafedebarrio.order.entity.EstadoPedido;
import com.cafedebarrio.order.repository.PedidoRepository;
import com.cafedebarrio.order.service.PedidoService;
import com.cafedebarrio.product.entity.Producto;
import com.cafedebarrio.product.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class PedidoFlowIntegrationTest {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    private Producto productoPrueba;

    @BeforeEach
    void setUp() {
        pedidoRepository.deleteAll();
        productoRepository.deleteAll();
        categoriaRepository.deleteAll();

        Categoria cat = categoriaRepository.save(Categoria.builder()
                .nombre("Café de Especialidad")
                .descripcion("Granos seleccionados")
                .activo(true)
                .build());

        productoPrueba = productoRepository.save(Producto.builder()
                .nombre("Cajamarca Micro-lote")
                .descripcion("Notas a cacao y frutos rojos, tueste medio.")
                .precio(new BigDecimal("42.00"))
                .stock(5)
                .imagenUrl("https://images.unsplash.com/photo-1559056199-641a0ac8b55e")
                .activo(true)
                .categoria(cat)
                .build());
    }

    @Test
    void flujoCompleto_precioHistoricoYDevolucionUnicaDeStock() {
        PedidoResponse pedido = pedidoService.crearPedido(new CrearPedidoRequest(
                "Sofía Mendoza", "984555123", "Av. Pardo 300, Miraflores", "Piso 4", "Sin azúcar",
                List.of(new DetallePedidoRequest(productoPrueba.getId(), 2))));

        assertThat(pedido.total()).isEqualByComparingTo("84.00");
        assertThat(productoRepository.findById(productoPrueba.getId()).orElseThrow().getStock()).isEqualTo(3);

        // Actualizar precio del producto después de la compra no debe alterar el precio
        // histórico del pedido
        Producto p = productoRepository.findById(productoPrueba.getId()).orElseThrow();
        p.setPrecio(new BigDecimal("60.00"));
        productoRepository.save(p);

        PedidoResponse consultado = pedidoService.obtenerPorId(pedido.id());
        assertThat(consultado.detalles().getFirst().precioUnitario()).isEqualByComparingTo("42.00");
        assertThat(consultado.total()).isEqualByComparingTo("84.00");

        // Pasar a EN_PREPARACION y luego CANCELADO debe devolver stock exacto (3 + 2 =
        // 5)
        pedidoService.actualizarEstado(pedido.id(), new ActualizarEstadoPedidoRequest(EstadoPedido.EN_PREPARACION));
        PedidoResponse cancelado = pedidoService.actualizarEstado(pedido.id(),
                new ActualizarEstadoPedidoRequest(EstadoPedido.CANCELADO));

        assertThat(cancelado.estado()).isEqualTo(EstadoPedido.CANCELADO);
        assertThat(cancelado.historialEstados()).hasSize(3);
        assertThat(productoRepository.findById(productoPrueba.getId()).orElseThrow().getStock()).isEqualTo(5);
    }

    @Test
    void comprasConcurrentes_noDebenGenerarStockNegativo() throws Exception {
        int threads = 8;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger exitosos = new AtomicInteger(0);
        AtomicInteger rechazados = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            final int idx = i;
            futures.add(executor.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    pedidoService.crearPedido(new CrearPedidoRequest(
                            "Cliente " + idx, "98700000" + idx, "Dirección " + idx + " Lima", null, null,
                            List.of(new DetallePedidoRequest(productoPrueba.getId(), 2))));
                    exitosos.incrementAndGet();
                } catch (Exception ex) {
                    rechazados.incrementAndGet();
                }
            }));
        }

        ready.await(5, TimeUnit.SECONDS);
        start.countDown();
        for (Future<?> f : futures) {
            f.get(10, TimeUnit.SECONDS);
        }
        executor.shutdown();

        // Con stock inicial 5 y pedidos de 2 unidades, máximo 2 compras pueden tener
        // éxito y sobra stock 1 (jamás negativo)
        int stockFinal = productoRepository.findById(productoPrueba.getId()).orElseThrow().getStock();
        assertThat(exitosos.get()).isEqualTo(2);
        assertThat(rechazados.get()).isEqualTo(6);
        assertThat(stockFinal).isEqualTo(1);
    }
}
