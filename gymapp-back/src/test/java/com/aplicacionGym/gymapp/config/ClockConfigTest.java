package com.aplicacionGym.gymapp.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

/**
 * Spec 0010: el backend decide "hoy" con un único Clock en la zona del negocio, no con la zona de
 * la JVM (la imagen de producción corre en UTC).
 */
class ClockConfigTest {

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(ClockConfig.class);

    @Test
    void ac_0010_01_elRelojUsaLaZonaDelNegocioYSePuedeConfigurar() {
        runner.run(context -> assertThat(context.getBean(Clock.class).getZone())
                .isEqualTo(ZoneId.of("America/Argentina/Buenos_Aires")));

        runner.withPropertyValues("app.zone-id=Europe/Madrid")
                .run(context -> assertThat(context.getBean(Clock.class).getZone())
                        .isEqualTo(ZoneId.of("Europe/Madrid")));
    }
}
