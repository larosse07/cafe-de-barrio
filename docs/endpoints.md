# Documentación de Endpoints — Café de Barrio API

Base URL local: `http://localhost:8080/api`  
Swagger UI interactivo: `http://localhost:8080/swagger-ui.html`  
OpenAPI JSON: `http://localhost:8080/api-docs`

---

## 1. Autenticación (`/api/auth`)

### `POST /api/auth/login` (Público)
Autentica al administrador y emite `accessToken` JWT + `refreshToken`.

**Request:**
```json
{
  "email": "admin@cafedebarrio.local",
  "password": "TuPasswordSeguro"
}
```
**Response `200 OK`:**
```json
{
  "accessToken": "eyJhbGciOiJIUzM4NCJ9...",
  "refreshToken": "a1b2c3d4-...-e5f6",
  "tokenType": "Bearer",
  "expiresInMs": 3600000,
  "user": {
    "id": 1,
    "nombre": "Administrador",
    "email": "admin@cafedebarrio.local",
    "rol": "ADMIN"
  }
}
```

### `POST /api/auth/refresh` (Público)
Rota el `refreshToken` y entrega un nuevo par de tokens.
```json
{ "refreshToken": "a1b2c3d4-..." }
```

### `POST /api/auth/logout` (Público)
Revoca el `refreshToken` enviado en el cuerpo.
```json
{ "refreshToken": "a1b2c3d4-..." }
```

### `GET /api/auth/me` (Admin — `Authorization: Bearer <token>`)
Devuelve los datos del administrador autenticado.

---

## 2. Productos (`/api/productos`)

### `GET /api/productos` (Público / Admin)
Soporta filtros combinables y paginación:
- `categoria` (Long, opcional): ID de categoría.
- `disponible` (Boolean, opcional): `true` para stock > 0, `false` para agotados.
- `search` (String, opcional): búsqueda parcial por nombre o descripción.
- `incluirInactivos` (Boolean, solo efectivo con rol `ADMIN`).
- `page` (int, default `0`), `size` (int, default `12`, máx `100`).
- `sortBy` (`fechaCreacion`, `precio`, `nombre`, `stock`, `id`), `sortDir` (`asc` | `desc`).

### `GET /api/productos/{id}` (Público / Admin)
Obtiene el detalle de un producto. Los usuarios públicos reciben `404` si el producto está inactivo.

### `POST /api/productos` (Admin)
Crea un producto validando `precio > 0`, `stock >= 0` y categoría existente.

### `PUT /api/productos/{id}` (Admin)
Actualiza todos los campos de un producto.

### `DELETE /api/productos/{id}` (Admin)
Desactiva el producto (`activo = false`) preservando el historial de ventas.

---

## 3. Categorías (`/api/categorias`)

### `GET /api/categorias` (Público / Admin)
Parámetros: `search` (opcional), `incluirInactivos` (solo `ADMIN`).

### `GET /api/categorias/{id}` (Público)
Retorna la categoría y el conteo de productos asociados.

### `POST /api/categorias` (Admin)
Crea una categoría con nombre único (`409 Conflict` si ya existe).

### `PUT /api/categorias/{id}` (Admin)
Actualiza nombre, descripción y estado activo.

### `DELETE /api/categorias/{id}` (Admin)
Elimina la categoría únicamente si no tiene productos asociados (`409 Conflict` en caso contrario).

---

## 4. Pedidos (`/api/pedidos`)

### `POST /api/pedidos` (Público — Checkout)
Registra un nuevo pedido calculando precios y total en el servidor y descontando stock atómicamente.

**Request:**
```json
{
  "clienteNombre": "María Fernanda Salazar",
  "celular": "987654321",
  "direccion": "Av. Larco 450, Dpto. 302, Miraflores",
  "referencia": "Frente al parque",
  "observaciones": "Molido para prensa francesa",
  "items": [
    { "productoId": 1, "cantidad": 2 },
    { "productoId": 6, "cantidad": 1 }
  ]
}
```
**Errores posibles:** `400 Bad Request` (validación / producto inactivo), `404 Not Found` (producto inexistente), `409 Conflict` (stock insuficiente).

### `GET /api/pedidos` (Admin)
Parámetros: `estado` (`PENDIENTE`, `EN_PREPARACION`, `ENTREGADO`, `CANCELADO`), `fechaDesde` (`YYYY-MM-DD`), `fechaHasta` (`YYYY-MM-DD`), `search`, `page`, `size`.

### `GET /api/pedidos/{id}` (Admin)
Retorna detalle completo, ítems con precio histórico e `historialEstados`.

### `PATCH /api/pedidos/{id}/estado` (Admin)
Actualiza el estado del pedido respetando transiciones válidas y devolviendo stock una única vez al cancelar.
```json
{ "estado": "EN_PREPARACION" }
```

---

## 5. Dashboard (`/api/dashboard`) — Solo Admin

### `GET /api/dashboard/resumen`
Retorna totales reales de productos, activos, stock bajo (≤ 10), pedidos por estado y ventas registradas (excluyendo cancelados).

### `GET /api/dashboard/ventas?periodo=7d|30d|90d|all`
Retorna total de ventas, cantidad de pedidos válidos, ticket promedio y serie diaria real.

### `GET /api/dashboard/pedidos?periodo=7d|30d|90d|all`
Retorna distribución por estado y volumen diario real de pedidos.
