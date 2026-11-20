package com.cafedebarrio.config;

import com.cafedebarrio.auth.entity.Rol;
import com.cafedebarrio.auth.entity.Usuario;
import com.cafedebarrio.auth.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1)
@RequiredArgsConstructor
public class AdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name:Administrador}")
    private String adminName;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.warn("Variables ADMIN_EMAIL o ADMIN_PASSWORD vacías; se omite la creación automática del administrador.");
            return;
        }

        String normalizedEmail = adminEmail.trim().toLowerCase();
        var existingOpt = usuarioRepository.findByEmailIgnoreCase(normalizedEmail);
        if (existingOpt.isPresent()) {
            Usuario existing = existingOpt.get();
            if (!passwordEncoder.matches(adminPassword, existing.getPasswordHash())) {
                existing.setPasswordHash(passwordEncoder.encode(adminPassword));
                existing.setActivo(true);
                usuarioRepository.save(existing);
                log.info("Contraseña del administrador inicial sincronizada ({}).", normalizedEmail);
            } else {
                log.info("Administrador inicial ya registrado ({}).", normalizedEmail);
            }
            return;
        }

        Usuario admin = Usuario.builder()
                .nombre(adminName.trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .rol(Rol.ADMIN)
                .activo(true)
                .build();

        usuarioRepository.save(admin);
        log.info("Usuario administrador inicial creado de forma segura ({}).", admin.getEmail());
    }
}
