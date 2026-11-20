package com.cafedebarrio.auth.service;

import com.cafedebarrio.auth.dto.AuthResponse;
import com.cafedebarrio.auth.dto.LoginRequest;
import com.cafedebarrio.auth.dto.RefreshTokenRequest;
import com.cafedebarrio.auth.dto.UserInfoResponse;
import com.cafedebarrio.auth.entity.RefreshToken;
import com.cafedebarrio.auth.entity.Usuario;
import com.cafedebarrio.auth.repository.RefreshTokenRepository;
import com.cafedebarrio.auth.repository.UsuarioRepository;
import com.cafedebarrio.common.exception.UnauthorizedException;
import com.cafedebarrio.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
            );
        } catch (AuthenticationException ex) {
            throw new UnauthorizedException("Credenciales inválidas. Verifica tu correo y contraseña.");
        }

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new UnauthorizedException("Credenciales inválidas."));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new UnauthorizedException("Esta cuenta administrativa se encuentra desactivada.");
        }

        return issueTokens(usuario);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken existing = refreshTokenRepository.findByToken(request.refreshToken().trim())
                .orElseThrow(() -> new UnauthorizedException("Sesión expirada o token de actualización inválido."));

        if (Boolean.TRUE.equals(existing.getRevocado())
                || existing.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("El token de actualización ha expirado o fue revocado.");
        }

        Usuario usuario = existing.getUsuario();
        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new UnauthorizedException("Esta cuenta administrativa se encuentra desactivada.");
        }

        // Rotación segura de refresh token
        existing.setRevocado(true);
        refreshTokenRepository.save(existing);

        return issueTokens(usuario);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        refreshTokenRepository.findByToken(refreshToken.trim()).ifPresent(rt -> {
            rt.setRevocado(true);
            refreshTokenRepository.save(rt);
        });
    }

    @Transactional(readOnly = true)
    public UserInfoResponse getCurrentUser(String email) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado."));
        return toUserInfo(usuario);
    }

    private AuthResponse issueTokens(Usuario usuario) {
        String accessToken = jwtService.generateAccessToken(usuario);
        String refreshTokenValue = UUID.randomUUID() + "." + UUID.randomUUID();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenValue)
                .usuario(usuario)
                .fechaExpiracion(LocalDateTime.now().plusNanos(jwtService.getRefreshExpirationMs() * 1_000_000L))
                .revocado(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshTokenValue,
                "Bearer",
                jwtService.getExpirationMs(),
                toUserInfo(usuario)
        );
    }

    private UserInfoResponse toUserInfo(Usuario usuario) {
        return new UserInfoResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name()
        );
    }
}
