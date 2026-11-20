package com.cafedebarrio.order.controller;

import com.cafedebarrio.common.response.PageResponse;
import com.cafedebarrio.order.dto.ActualizarEstadoPedidoRequest;
import com.cafedebarrio.order.dto.CrearPedidoRequest;
import com.cafedebarrio.order.dto.PedidoResponse;
import com.cafedebarrio.order.entity.EstadoPedido;
import com.cafedebarrio.order.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "Registro público de pedidos y gestión administrativa")
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    @Operation(summary = "Registrar un nuevo pedido desde la tienda (Checkout público)")
    public ResponseEntity<PedidoResponse> crear(@Valid @RequestBody CrearPedidoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.crearPedido(request));
    }

    @GetMapping
    @Operation(summary = "Listar pedidos con filtros por estado, fecha y búsqueda (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PageResponse<PedidoResponse>> listar(
            @RequestParam(required = false) EstadoPedido estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(pedidoService.listar(estado, fechaDesde, fechaHasta, search, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle completo e historial de un pedido (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PedidoResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.obtenerPorId(id));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Actualizar el estado de un pedido con reglas de negocio (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PedidoResponse> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoPedidoRequest request
    ) {
        return ResponseEntity.ok(pedidoService.actualizarEstado(id, request));
    }
}
