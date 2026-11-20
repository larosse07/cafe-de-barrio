package com.cafedebarrio.category;

import com.cafedebarrio.category.dto.CategoriaRequest;
import com.cafedebarrio.category.dto.CategoriaResponse;
import com.cafedebarrio.category.entity.Categoria;
import com.cafedebarrio.category.mapper.CategoriaMapper;
import com.cafedebarrio.category.repository.CategoriaRepository;
import com.cafedebarrio.category.service.CategoriaService;
import com.cafedebarrio.common.exception.ConflictException;
import com.cafedebarrio.product.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private ProductoRepository productoRepository;

    private CategoriaService categoriaService;

    @BeforeEach
    void setUp() {
        categoriaService = new CategoriaService(categoriaRepository, productoRepository, new CategoriaMapper());
    }

    @Test
    void crear_debeGuardarNuevaCategoria() {
        CategoriaRequest req = new CategoriaRequest("Métodos", "Herramientas de extracción", true);
        when(categoriaRepository.findByNombreIgnoreCase("Métodos")).thenReturn(Optional.empty());
        when(categoriaRepository.save(any(Categoria.class))).thenAnswer(inv -> {
            Categoria c = inv.getArgument(0);
            c.setId(3L);
            return c;
        });

        CategoriaResponse res = categoriaService.crear(req);
        assertThat(res.id()).isEqualTo(3L);
        assertThat(res.nombre()).isEqualTo("Métodos");
    }

    @Test
    void eliminar_debeFallarCuandoExistenProductosAsociados() {
        Categoria cat = Categoria.builder().id(1L).nombre("Café").descripcion("Granos").activo(true).build();
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(productoRepository.existsByCategoriaId(1L)).thenReturn(true);

        assertThatThrownBy(() -> categoriaService.eliminar(1L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("productos asociados");

        verify(categoriaRepository, never()).delete(any());
    }

    @Test
    void eliminar_debePermitirCuandoNoHayProductos() {
        Categoria cat = Categoria.builder().id(2L).nombre("Vacía").descripcion("Sin productos").activo(true).build();
        when(categoriaRepository.findById(2L)).thenReturn(Optional.of(cat));
        when(productoRepository.existsByCategoriaId(2L)).thenReturn(false);

        categoriaService.eliminar(2L);

        verify(categoriaRepository).delete(cat);
    }
}
