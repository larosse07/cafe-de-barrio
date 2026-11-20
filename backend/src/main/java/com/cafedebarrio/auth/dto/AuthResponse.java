package com.cafedebarrio.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInMs,
        UserInfoResponse user
) {
}
