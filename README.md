# Café de Barrio — E-commerce Fullstack Profesional

Sistema e-commerce comercial completo para **Café de Barrio**, cafetería y tostaduría de especialidad peruana. Incluye tienda pública responsiva, carrito con persistencia y revalidación de stock, checkout conectado a base de datos y panel administrativo protegido con JWT.

---

## Stack Tecnológico

- **Backend:** Java 21, Spring Boot 3.5, Spring Web, Spring Data JPA, Spring Security, Spring Validation, Hibernate, JWT (`jjwt 0.12`), BCrypt, OpenAPI / Swagger UI, JUnit 5, Mockito.
- **Frontend:** Angular 22 (standalone components + signals), TypeScript estricto, Angular Router, HttpClient + Interceptors funcionales, Reactive Forms, RxJS, SCSS con sistema de diseño global, Vitest.
- **Base de datos:** MySQL 8 (compatible con MariaDB 10.4+), moneda única en Soles Peruanos (`PEN`).
- **Infraestructura:** Docker & Docker Compose (multi-stage builds, health checks y configuración runtime sin recompilar).

---

## Estructura del Repositorio

```text
CAFE-BARRIO/
├── backend/                  # API REST Java 21 + Spring Boot
│   ├── src/
│   ├── pom.xml
│   ├── .env.example
│   └── Dockerfile
├── frontend/                 # SPA Angular + Sistema de Diseño SCSS
│   ├── public/assets/        # runtime-config.json y fallback-coffee.svg
│   ├── src/
│   ├── package.json
│   ├── angular.json
│   ├── .env.example
│   └── Dockerfile
├── database/
│   └── init.sql              # Esquema SQL + 4 categorías + 14 productos en PEN
├── docs/
│   ├── arquitectura.md
│   ├── endpoints.md
│   └── pruebas.md
├── postman/
│   └── CafeDeBarrio.postman_collection.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Requisitos Previos

### Ejecución local independiente
- **Java JDK 21**
- **Maven 3.9+**
- **Node.js 22+ / npm 10+**
- **MySQL 8** (o MariaDB local en puerto `3306`)

### Ejecución con Docker
- **Docker** y **Docker Compose**

---

## Configuración de Variables de Entorno

> **Importante:** Nunca subas archivos `.env` con contraseñas o secretos reales al repositorio.

### Backend (`backend/.env`)
Copia `backend/.env.example` como `backend/.env` y configura tus valores:

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | Perfil activo (`dev` o `prod`) | `dev` |
| `SERVER_PORT` | Puerto HTTP del backend | `8080` |
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_NAME` | Nombre de la base de datos | `cafe_de_barrio` |
| `DB_USERNAME` | Usuario MySQL | `root` |
| `DB_PASSWORD` | Contraseña MySQL | *(tu clave local)* |
| `JWT_SECRET` | Secreto HMAC-SHA (mínimo 32 caracteres) | *(generar clave aleatoria segura)* |
| `JWT_EXPIRATION` | Expiración Access Token (ms) | `3600000` |
| `JWT_REFRESH_EXPIRATION` | Expiración Refresh Token (ms) | `604800000` |
| `ADMIN_NAME` | Nombre del administrador inicial | `Administrador` |
| `ADMIN_EMAIL` | Correo del administrador inicial | `admin@cafedebarrio.local` |
| `ADMIN_PASSWORD` | Contraseña inicial (hasheada con BCrypt) | *(configurar tu clave segura)* |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos separados por coma | `http://localhost:4200` |

### Frontend (`frontend/public/assets/runtime-config.json`)
En desarrollo utiliza `http://localhost:8080/api`. En producción / Docker, el entrypoint del contenedor escribe `runtime-config.json` desde la variable `API_BASE_URL` al iniciar, sin necesidad de recompilar la aplicación Angular.

---

## Inicialización de Base de Datos

Ejecuta el script SQL en tu servidor MySQL 8:

```bash
mysql -u root -p < database/init.sql
```

Esto crea la base de datos `cafe_de_barrio`, sus tablas, índices, restricciones `CHECK`, 4 categorías y 14 productos realistas en Soles (`PEN`).  
El usuario administrador se crea automáticamente de forma idempotente al arrancar Spring Boot usando `ADMIN_EMAIL` y `ADMIN_PASSWORD` (almacenado con BCrypt).

---

## Ejecución Local

### 1. Backend (Spring Boot)
```bash
cd backend
cp .env.example .env
# Edita backend/.env y configura DB_PASSWORD, JWT_SECRET y ADMIN_PASSWORD
mvn spring-boot:run
```
- API disponible en: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 2. Frontend (Angular)
```bash
cd frontend
npm install
npm start
```
- Tienda pública: `http://localhost:4200`
- Panel administrativo: `http://localhost:4200/admin/login`

---

## Ejecución con Docker Compose

Crea un archivo `.env` en la raíz del repositorio con al menos `JWT_SECRET`, `ADMIN_PASSWORD` y `DB_PASSWORD`, y ejecuta:

```bash
docker compose up --build -d
```

- Tienda y Admin: `http://localhost:4200`
- Backend API / Swagger: `http://localhost:8080/swagger-ui.html`
- MySQL 8: puerto `3306` con volumen persistente `mysql_data`.

---

## Pruebas Automatizadas

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend
npm test -- --watch=false
```

---

## Documentación Adicional

- [Arquitectura del sistema](docs/arquitectura.md)
- [Referencia completa de endpoints](docs/endpoints.md)
- [Estrategia y detalle de pruebas](docs/pruebas.md)
- [Colección Postman importable](postman/CafeDeBarrio.postman_collection.json)

---

## Solución de Errores Frecuentes

1. **`JWT_SECRET` inválida al iniciar backend:** Asegúrate de configurar `JWT_SECRET` con al menos 32 caracteres en `backend/.env` o en las variables de entorno del sistema.
2. **Error de conexión a MySQL (`Communications link failure`):** Verifica que el servicio MySQL esté activo en `DB_HOST:DB_PORT` y que `database/init.sql` se haya ejecutado.
3. **Error CORS en el navegador:** Verifica que la URL del frontend (`http://localhost:4200`) esté listada en `CORS_ALLOWED_ORIGINS`.
4. **No se puede eliminar una categoría (`409 Conflict`):** Es una regla de negocio intencional: primero reasigna o desactiva los productos vinculados.
