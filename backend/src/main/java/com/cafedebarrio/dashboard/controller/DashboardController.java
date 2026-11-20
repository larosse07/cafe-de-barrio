package com.cafedebarrio.dashboard.controller;

import com.cafedebarrio.dashboard.dto.DashboardResumenResponse;
import com.cafedebarrio.dashboard.dto.PedidosEstadisticaResponse;
import com.cafedebarrio.dashboard.dto.VentasPeriodoResponse;
import com.cafedebarrio.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Dashboard", description = "Indicadores y estadísticas en tiempo real del panel administrativo")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumen")
    @Operation(summary = "Obtener resumen global de productos, inventario, pedidos y ventas")
    public ResponseEntity<DashboardResumenResponse> resumen() {
        return ResponseEntity.ok(dashboardService.obtenerResumen());
    }

    @GetMapping("/ventas")
    @Operation(summary = "Obtener serie temporal de ventas filtrada por periodo (7d, 30d, 90d, all)")
    public ResponseEntity<VentasPeriodoResponse> ventas(@RequestParam(defaultValue = "30d") String periodo) {
        return ResponseEntity.ok(dashboardService.obtenerVentas(periodo));
    }

    @GetMapping("/pedidos")
    @Operation(summary = "Obtener estadísticas de pedidos por estado y día (7d, 30d, 90d, all)")
    public ResponseEntity<PedidosEstadisticaResponse> pedidos(@RequestParam(defaultValue = "30d") String periodo) {
        return ResponseEntity.ok(dashboardService.obtenerPedidos(periodo));
    }
}
