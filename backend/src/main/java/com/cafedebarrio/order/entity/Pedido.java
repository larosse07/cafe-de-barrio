package com.cafedebarrio.order.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos", indexes = {
        @Index(name = "idx_pedidos_estado", columnList = "estado"),
        @Index(name = "idx_pedidos_fecha", columnList = "fecha"),
        @Index(name = "idx_pedidos_cliente", columnList = "cliente_nombre")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String codigo;

    @Column(name = "cliente_nombre", nullable = false, length = 150)
    private String clienteNombre;

    @Column(nullable = false, length = 20)
    private String celular;

    @Column(nullable = false, length = 255)
    private String direccion;

    @Column(length = 255)
    private String referencia;

    @Column(length = 500)
    private String observaciones;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private EstadoPedido estado;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "stock_devuelto", nullable = false)
    @Builder.Default
    private Boolean stockDevuelto = false;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DetallePedido> detalles = new ArrayList<>();

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("fechaCambio ASC, id ASC")
    @Builder.Default
    private List<HistorialEstadoPedido> historialEstados = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.fecha == null) {
            this.fecha = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = EstadoPedido.PENDIENTE;
        }
        if (this.stockDevuelto == null) {
            this.stockDevuelto = false;
        }
    }

    public void addDetalle(DetallePedido detalle) {
        detalles.add(detalle);
        detalle.setPedido(this);
    }

    public void addHistorial(HistorialEstadoPedido historial) {
        historialEstados.add(historial);
        historial.setPedido(this);
    }
}
