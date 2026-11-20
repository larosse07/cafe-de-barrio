# Estrategia y Reporte de Pruebas — Café de Barrio

## 1. Pruebas Backend (JUnit 5 + Mockito + Spring Boot Test + MockMvc)

| Suite | Cobertura |
| --- | --- |
| `ProductoServiceTest` | Creación válida, rechazo de precio negativo/cero, rechazo de stock negativo, ocultamiento de inactivos al público, desactivación lógica. |
| `CategoriaServiceTest` | Creación de categorías, bloqueo de eliminación cuando existen productos asociados (`409 Conflict`), eliminación permitida cuando está vacía. |
| `PedidoServiceTest` | Cálculo de totales en backend, descuento de stock, rechazo por stock insuficiente (`409`), rechazo de producto inactivo, cancelación con devolución única de stock y rechazo de transiciones inválidas. |
| `PedidoFlowIntegrationTest` | Integración JPA/transacciones: inmutabilidad del precio histórico tras actualizar precio del producto, historial de estados completo y **prueba concurrente multi-hilo (8 hilos simultáneos)** verificando que el stock nunca sea negativo. |
| `AuthSecurityIntegrationTest` | Endpoints públicos vs protegidos (`401` sin JWT), login fallido (`401`), login válido (`200`), acceso a `/api/auth/me` y `/api/dashboard/resumen` con JWT, rotación de `refreshToken`, rechazo de token antiguo y `logout`. |

### Comando de ejecución
```bash
cd backend
mvn test
```

## 2. Pruebas Frontend (Angular + Vitest)

| Suite | Cobertura |
| --- | --- |
| `app.spec.ts` | Inicialización del shell raíz de la aplicación. |
| `cart.service.spec.ts` | Agregar productos, cálculo de totales, persistencia en `LocalStorage`, bloqueo al superar stock, incremento/decremento y revalidación de stock contra el backend. |
| `auth.guard.spec.ts` | Redirección a `/admin/login` sin sesión y permiso concedido a rol `ADMIN`. |
| `error.interceptor.spec.ts` | Traducción amigable de errores HTTP (`409 Conflict`, servidor no disponible `status 0`). |
| `checkout.component.spec.ts` | Validación de formulario reactivo, preservación de datos y carrito ante error recuperable, y limpieza del carrito + navegación únicamente ante pedido exitoso. |
| `product-card.component.spec.ts` | Renderizado de precios en PEN (`S/`), bloqueo de compra sin stock y emisión de evento al agregar. |

### Comando de ejecución
```bash
cd frontend
npm test -- --watch=false
```

## 3. Verificación E2E Local con MySQL

Se verifica contra la instancia local real:
- Carga del esquema `database/init.sql` y datos iniciales (4 categorías, 14 productos).
- Arranque de Spring Boot conectado a MySQL y creación idempotente del administrador.
- Arranque de Angular (`ng serve`) conectado al backend.
- Flujo completo de catálogo, filtros, detalle, carrito, checkout, descuento real de stock en MySQL, login administrativo, dashboard, CRUD y cancelación con devolución única de stock.
