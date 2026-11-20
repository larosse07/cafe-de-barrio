package com.cafedebarrio.auth.dto;

public record UserInfoResponse(
        Long id,
        String nombre,
        String email,
        String rol
) {
}
