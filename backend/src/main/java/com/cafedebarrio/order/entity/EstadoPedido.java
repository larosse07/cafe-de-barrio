package com.cafedebarrio.order.entity;

import java.util.EnumSet;
import java.util.Set;

public enum EstadoPedido {
    PENDIENTE,
    EN_PREPARACION,
    ENTREGADO,
    CANCELADO;

    public Set<EstadoPedido> allowedTransitions() {
        return switch (this) {
            case PENDIENTE -> EnumSet.of(EN_PREPARACION, CANCELADO);
            case EN_PREPARACION -> EnumSet.of(ENTREGADO, CANCELADO);
            case ENTREGADO, CANCELADO -> EnumSet.noneOf(EstadoPedido.class);
        };
    }

    public boolean canTransitionTo(EstadoPedido next) {
        return next != null && allowedTransitions().contains(next);
    }
}
