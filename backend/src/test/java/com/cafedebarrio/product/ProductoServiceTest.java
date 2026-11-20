package com.cafedebarrio.product;

import com.cafedebarrio.category.entity.Categoria;
import com.cafedebarrio.category.repository.CategoriaRepository;
import com.cafedebarrio.common.exception.BusinessException;
import com.cafedebarrio.common.exception.ResourceNotFoundException;
import com.cafedebarrio.product.dto.ProductoRequest;
import com.cafedebarrio.product.dto.ProductoResponse;
import com.cafedebarrio.product.entity.Producto;
import com.cafedebarrio.product.mapper.ProductoMapper;
import com.cafedebarrio.product.repository.ProductoRepository;
import com.cafedebarrio.product.service.ProductoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    private ProductoService productoService;

    @BeforeEach
    void setUp() {
        productoService = new ProductoService(productoRepository, categoriaRepository, new ProductoMapper());
    }

    @Test
    void crear_debeGuardarProductoValido() {
        Categoria categoria = Categoria.builder().id(1L).nombre("Café de Especialidad").descripcion("Granos").activo(true).build();
        ProductoRequest request = new ProductoRequest(
                "Cajamarca 250g",
                "Café lavado de altura con notas a panela y cacao.",
                new BigDecimal("38.00"),
                15,
                "https://images.unsplash.com/photo-1559056199-641a0ac8b55e",
                1L,
                true
        );

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productoRepository.save(any(Producto.class))).thenAnswer(inv -> {
            Producto p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        ProductoResponse response = productoService.crear(request);

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.precio()).isEqualByComparingTo("38.00");
        assertThat(response.disponible()).isTrue();
        assertThat(response.categoriaNombre()).isEqualTo("Café de Especialidad");
    }

    @Test
    void crear_debeRechazarPrecioNegativoOCero() {
        ProductoRequest request = new ProductoRequest(
                "Café inválido",
                "Descripción válida de prueba para producto.",
                new BigDecimal("-5.00"),
                10,
                "https://images.unsplash.com/photo-1559056199-641a0ac8b55e",
                1L,
                true
        );

        assertThatThrownBy(() -> productoService.crear(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("mayor a cero");
    }

    @Test
    void crear_debeRechazarStockNegativo() {
        ProductoRequest request = new ProductoRequest(
                "Café sin stock válido",
                "Descripción válida de prueba para producto.",
                new BigDecimal("25.00"),
                -1,
                "https://images.unsplash.com/photo-1559056199-641a0ac8b55e",
                1L,
                true
        );

        assertThatThrownBy(() -> productoService.crear(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("no puede ser negativo");
    }

    @Test
    void obtenerPorId_publicoNoDebeVerProductoInactivo() {
        Categoria categoria = Categoria.builder().id(1L).nombre("Café").descripcion("Desc").activo(true).build();
        Producto inactivo = Producto.builder()
                .id(5L)
                .nombre("Descontinuado")
                .descripcion("No disponible")
                .precio(new BigDecimal("20.00"))
                .stock(5)
                .imagenUrl("https://example.com/a.jpg")
                .activo(false)
                .categoria(categoria)
                .build();

        when(productoRepository.findByIdWithCategoria(5L)).thenReturn(Optional.of(inactivo));

        assertThatThrownBy(() -> productoService.obtenerPorId(5L, false))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void desactivar_debeMarcarProductoComoInactivo() {
        Producto producto = Producto.builder().id(7L).nombre("Latte").activo(true).build();
        when(productoRepository.findById(7L)).thenReturn(Optional.of(producto));

        productoService.desactivar(7L);

        assertThat(producto.getActivo()).isFalse();
        verify(productoRepository).save(producto);
    }
}
