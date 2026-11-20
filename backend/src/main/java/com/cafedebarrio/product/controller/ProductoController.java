package com.cafedebarrio.product.controller;

import com.cafedebarrio.common.response.ApiResponse;
import com.cafedebarrio.common.response.PageResponse;
import com.cafedebarrio.product.dto.ProductoRequest;
import com.cafedebarrio.product.dto.ProductoResponse;
import com.cafedebarrio.product.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "Catálogo público y gestión administrativa de productos")
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    @Operation(summary = "Listar productos con filtros, ordenamiento y paginación")
    public ResponseEntity<PageResponse<ProductoResponse>> listar(
            @RequestParam(required = false) Long categoria,
            @RequestParam(required = false) Boolean disponible,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean incluirInactivos,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "fechaCreacion") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication
    ) {
        boolean canSeeInactive = incluirInactivos && isAdmin(authentication);
        return ResponseEntity.ok(
                productoService.listar(categoria, disponible, search, canSeeInactive, page, size, sortBy, sortDir)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de un producto por ID")
    public ResponseEntity<ProductoResponse> obtenerPorId(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(productoService.obtenerPorId(id, isAdmin(authentication)));
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo producto (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un producto existente (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ProductoResponse> actualizar(@PathVariable Long id,
                                                       @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar un producto del catálogo (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        productoService.desactivar(id);
        return ResponseEntity.ok(ApiResponse.ok("Producto desactivado correctamente.", null));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
