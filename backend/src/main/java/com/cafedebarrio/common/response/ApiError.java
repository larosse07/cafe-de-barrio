package com.cafedebarrio.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        int status,
        String error,
        String message,
        String path,
        LocalDateTime timestamp,
        Map<String, String> validationErrors
) {
    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(status, error, message, path, LocalDateTime.now(), null);
    }

    public static ApiError withValidation(int status, String error, String message, String path, Map<String, String> validationErrors) {
        return new ApiError(status, error, message, path, LocalDateTime.now(), validationErrors);
    }
}
