# Arquitectura de Software — Café de Barrio

## 1. Visión General

**Café de Barrio** es un sistema Fullstack desacoplado compuesto por tres capas independientes:

1. **Frontend SPA (Angular + TypeScript estricto + SCSS)**:
   - Tienda pública con catálogo dinámico, detalle, carrito persistido en `LocalStorage` y checkout con revalidación en backend.
   - Panel administrativo protegido por `AuthGuard` e interceptor JWT con rotación automática de `refreshToken`.
   - Sistema de diseño global basado en variables CSS (`_tokens.scss`, `_components.scss`, `_animations.scss`).
   - Configuración externa en producción mediante `/assets/runtime-config.json` (inyectado al iniciar el contenedor Nginx sin recompilar el bundle).

2. **Backend API REST (Java 21 + Spring Boot 3.5)**:
   - Arquitectura modular por dominio (`auth`, `category`, `product`, `order`, `dashboard`) + capas transversales (`config`, `security`, `common`).
   - Separación estricta de responsabilidades: `Controller -> Service -> Repository`, DTOs inmutables (`record`) y `Mapper` dedicados. Ninguna entidad JPA se expone directamente.
   - Seguridad stateless con Spring Security, BCrypt (coste 12), JWT firmado con HMAC-SHA y `RefreshToken` persistido en base de datos con rotación e invalidación en logout.
   - Control de concurrencia en inventario mediante bloqueo pesimista (`LockModeType.PESSIMISTIC_WRITE`) con ordenamiento determinista por `productoId` (evitando deadlocks) y bloqueo optimista (`@Version`) como segunda línea de defensa.
   - Prevención de consultas N+1 mediante `@EntityGraph` y paginación en dos fases en pedidos (`findFilteredIds` + `findAllByIdInWithDetalles`).

3. **Base de Datos Relacional (MySQL 8)**:
   - Esquema normalizado (`categorias`, `productos`, `pedidos`, `detalle_pedidos`, `historial_estado_pedido`, `usuarios`, `refresh_tokens`).
   - Restricciones `CHECK` (`precio >= 0`, `stock >= 0`, `cantidad > 0`), llaves foráneas e índices orientados a filtros frecuentes.
   - Uso estricto de `DECIMAL(10,2)` / `DECIMAL(12,2)` mapeado a `BigDecimal` para importes en Soles Peruanos (`PEN`) y `DATETIME` mapeado a `LocalDateTime`.

## 2. Flujo Crítico de Compra e Inventario

1. El cliente selecciona productos reales desde `GET /api/productos` y los gestiona en `CartService`.
2. Antes de pasar al checkout, `CartService.revalidateStock()` consulta los productos vigentes en el backend para sincronizar stock y precios.
3. Al confirmar el checkout (`POST /api/pedidos`):
   - El backend consolida ítems repetidos y ordena los `productoId` ascendentemente.
   - Dentro de una transacción `@Transactional`, bloquea cada fila de producto con `SELECT ... FOR UPDATE`.
   - Verifica que producto y categoría estén activos y que `stock >= cantidad`.
   - Descuenta el stock, guarda el `precioUnitario` histórico en `detalle_pedidos` y calcula `subtotal` y `total` exclusivamente en el servidor.
   - Registra el evento inicial en `historial_estado_pedido` (`PENDIENTE`).
4. Si un administrador cancela el pedido (`PATCH /api/pedidos/{id}/estado` con `CANCELADO`):
   - Se valida la máquina de estados (`PENDIENTE -> EN_PREPARACION | CANCELADO`, `EN_PREPARACION -> ENTREGADO | CANCELADO`; `ENTREGADO` y `CANCELADO` son estados terminales).
   - Se bloquea el pedido (`findByIdForUpdate`) y, únicamente si `stockDevuelto == false`, se devuelve el stock de cada detalle y se marca `stockDevuelto = true`. Esto garantiza que el inventario jamás se devuelva dos veces.

## 3. Decisiones Técnicas Documentadas

- **Moneda única (`PEN`)**: Todos los montos en base de datos, API y frontend se muestran en Soles Peruanos (`S/`).
- **Desactivación lógica de productos (`DELETE /api/productos/{id}`)**: En lugar de borrar físicamente un producto (lo que comprometería integridad referencial de pedidos históricos), se marca `activo = false`.
- **Eliminación controlada de categorías (`DELETE /api/categorias/{id}`)**: Solo se permite cuando no existen productos asociados; de lo contrario el servidor responde `409 Conflict`.
- **Iconografía y gráficos ligeros**: Se implementó un conjunto de iconos SVG consistentes estilo Lucide (`AppIconComponent`) y gráficos de barras/distribución nativos basados en datos reales del backend para evitar sobrecarga de dependencias y mantener coherencia exacta con la paleta artesanal.
