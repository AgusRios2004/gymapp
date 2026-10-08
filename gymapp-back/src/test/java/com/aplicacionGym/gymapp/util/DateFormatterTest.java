package com.aplicacionGym.gymapp.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.Locale;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Spec 0015 (BUG-22): las fechas dentro de un mensaje salen como DD/MM/AAAA, sin depender del
 * locale de la JVM, que en la imagen de producción es en_US.
 */
class DateFormatterTest {

    private Locale original;

    @BeforeEach
    void usarLocaleDeProduccion() {
        original = Locale.getDefault();
        Locale.setDefault(Locale.US);
    }

    @AfterEach
    void restaurarLocale() {
        Locale.setDefault(original);
    }

    @Test
    @DisplayName("AC-0015-12: 2027-01-05 se escribe 05/01/2027, también con el locale en_US")
    void ac_0015_12_laFechaSaleComoDiaMesAnioConCeros() {
        assertThat(DateFormatter.format(LocalDate.of(2027, 1, 5))).isEqualTo("05/01/2027");
    }
}
