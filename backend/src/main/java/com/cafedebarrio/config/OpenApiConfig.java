package com.cafedebarrio.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cafeDeBarrioOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Café de Barrio — API REST")
                        .version("1.0.0")
                        .description("API comercial Fullstack para la tienda de café de especialidad y panel administrativo Café de Barrio.")
                        .contact(new Contact().name("Equipo Café de Barrio")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Token JWT obtenido mediante POST /api/auth/login")));
    }
}
