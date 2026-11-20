package com.cafedebarrio.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CrearPedidoRequest(
        @NotBlank(message = "El nombre completo es obligatorio")
        @Size(min = 3, max = 150, message = "El nombre debe tener entre 3 y 150 caracteres")
        String clienteNombre,

        @NotBlank(message = "El número de celular es obligatorio")
        @Pattern(regexp = "^[0-9+\\-\\s]{9,20}$", message = "Ingresa un número de celular válido (mínimo 9 dígitos)")
        String celular,

        @NotBlank(message = "La dirección de entrega es obligatoria")
        @Size(min = 6, max = 255, message = "La dirección debe tener entre 6 y 255 caracteres")
        String direccion,

        @Size(max = 255, message = "La referencia no puede exceder 255 caracteres")
        String referencia,

        @Size(max = 500, message = "Las observaciones no pueden exceder 500 caracteres")
        String observaciones,

        @NotEmpty(message = "El pedido debe contener al menos un producto")
        @Valid
        List<DetallePedidoRequest> items
) {
}
