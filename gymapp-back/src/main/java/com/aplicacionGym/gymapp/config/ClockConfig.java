package com.aplicacionGym.gymapp.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Reloj del negocio (spec 0010, ADR-0011). Todo "hoy" del backend sale de acá con
 * {@code LocalDate.now(clock)}: la imagen de producción corre en UTC y {@code LocalDate.now()}
 * daba el día siguiente entre las 21 y las 24 de Argentina.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock(@Value("${app.zone-id:America/Argentina/Buenos_Aires}") String zoneId) {
        // ZoneId.of falla con el valor en el mensaje: una zona mal escrita corta el arranque en vez de caer en UTC.
        return Clock.system(ZoneId.of(zoneId));
    }
}
