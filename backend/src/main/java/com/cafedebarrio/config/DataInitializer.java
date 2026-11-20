package com.cafedebarrio.config;

import com.cafedebarrio.category.entity.Categoria;
import com.cafedebarrio.category.repository.CategoriaRepository;
import com.cafedebarrio.product.entity.Producto;
import com.cafedebarrio.product.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@Order(2)
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!seedEnabled || categoriaRepository.count() > 0 || productoRepository.count() > 0) {
            return;
        }

        Categoria especialidad = categoriaRepository.save(Categoria.builder()
                .nombre("Café de Especialidad")
                .descripcion("Granos seleccionados de origen peruano, tostados artesanalmente en lotes pequeños para preservar notas aromáticas.")
                .activo(true)
                .build());

        Categoria bebidas = categoriaRepository.save(Categoria.builder()
                .nombre("Bebidas de Barra")
                .descripcion("Preparaciones clásicas y de autor elaboradas al momento con espresso recién extraído y leche texturizada.")
                .activo(true)
                .build());

        Categoria pasteleria = categoriaRepository.save(Categoria.builder()
                .nombre("Pastelería Artesanal")
                .descripcion("Horneado diario con mantequilla de granja, cacao fino de aroma y masa madre.")
                .activo(true)
                .build());

        Categoria accesorios = categoriaRepository.save(Categoria.builder()
                .nombre("Métodos y Accesorios")
                .descripcion("Herramientas seleccionadas para extraer el mejor perfil de taza desde la comodidad de tu casa.")
                .activo(true)
                .build());

        List<Producto> productos = List.of(
                buildProduct("Cajamarca Origen 250g",
                        "Grano arábica 100% lavado de altura (1,850 msnm) cultivado en San Ignacio. Notas a panela, mandarina dulce y chocolate con leche. Tueste medio ideal para filtro y prensa francesa.",
                        "38.00", 28, "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=900&q=85", especialidad),
                buildProduct("Chanchamayo Blend de la Casa 250g",
                        "Nuestro tueste insignia de la selva central. Cuerpo cremoso, acidez equilibrada y perfil achocolatado con caramelo tostado. Perfecto para espresso, moka italiana y bebidas con leche.",
                        "34.50", 35, "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85", especialidad),
                buildProduct("Cusco Valle Sagrado Honey 250g",
                        "Micro-lote proceso Honey de Quillabamba. Aroma floral a jazmín, dulzor prolongado a miel de abeja y frutas de hueso. Edición limitada de cosecha reciente.",
                        "44.00", 14, "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=85", especialidad),
                buildProduct("Amazonas Descafeinado Natural 250g",
                        "Descafeinado mediante proceso natural con agua de montaña, sin solventes químicos. Mantiene notas suaves a avellana y cacao dulce para disfrutar a cualquier hora.",
                        "39.00", 18, "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=900&q=85", especialidad),
                buildProduct("Espresso Doble de Origen",
                        "Extracción precisa de 18g de nuestro blend de la casa. Crema color avellana, textura aterciopelada e intensidad balanceada para paladares exigentes.",
                        "11.00", 50, "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=900&q=85", bebidas),
                buildProduct("Flat White Artesanal",
                        "Doble ristretto coronado con microespuma sedosa de leche fresca vaporizada a 60 °C. Equilibrio perfecto entre la dulzura natural de la leche y el carácter del café.",
                        "14.50", 45, "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=900&q=85", bebidas),
                buildProduct("Cold Brew de 18 Horas 300ml",
                        "Infusión en frío de grano cajamarquino durante 18 horas. Baja acidez, refrescante y con intensas notas a cacao amargo y nuez tostada. Botella de vidrio lista para llevar.",
                        "16.00", 22, "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=85", bebidas),
                buildProduct("Latte de Vainilla de Papantla",
                        "Espresso doble infusionado con sirope artesanal de vaina de vainilla natural y leche vaporizada. Suave, reconfortante y sin saborizantes artificiales.",
                        "16.50", 32, "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85", bebidas),
                buildProduct("Croissant de Mantequilla Francesa",
                        "Hojaldre fermentado 48 horas con mantequilla pura. Corteza crujiente dorada y miga alveolar ligera que se deshace en boca.",
                        "12.00", 20, "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85", pasteleria),
                buildProduct("Rol de Canela y Cardamomo",
                        "Masa brioche suave enrollada con azúcar rubia, canela Ceilán y un toque sutil de cardamomo recién molido, glaseado con queso crema ligero.",
                        "13.50", 16, "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=85", pasteleria),
                buildProduct("Brownie de Cacao Piurano 70%",
                        "Elaborado con chocolate orgánico de Piura al 70%, nueces pecaneras tostadas y una pizca de sal de Maras. Interior húmedo y corteza delicadamente craquelada.",
                        "14.00", 19, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85", pasteleria),
                buildProduct("Cheesecake Vasco Horneado",
                        "Tarta de queso estilo San Sebastián con superficie caramelizada y centro cremoso. Maridaje ideal para cafés filtrados de notas frutales.",
                        "18.50", 12, "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85", pasteleria),
                buildProduct("Dripper V60 Cerámica Blanca",
                        "Cono de extracción manual en cerámica térmica tamaño 02. Sus estrías en espiral garantizan un flujo constante y tazas limpias llenas de matices.",
                        "89.00", 8, "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85", accesorios),
                buildProduct("Prensa Francesa Borosilicato 600ml",
                        "Cafetera de inmersión con vidrio resistente al calor y doble filtro de acero inoxidable. Extrae aceites naturales para un café con cuerpo completo.",
                        "75.00", 6, "https://images.unsplash.com/photo-1521302080334-4bebac2763a6?auto=format&fit=crop&w=900&q=85", accesorios)
        );

        productoRepository.saveAll(productos);
        log.info("Catálogo inicial de Café de Barrio cargado: 4 categorías y {} productos.", productos.size());
    }

    private Producto buildProduct(String nombre, String descripcion, String precio, int stock, String imagenUrl, Categoria categoria) {
        return Producto.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .precio(new BigDecimal(precio))
                .stock(stock)
                .imagenUrl(imagenUrl)
                .activo(true)
                .categoria(categoria)
                .build();
    }
}
