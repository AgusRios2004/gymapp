package com.aplicacionGym.gymapp.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Fechas dentro de un mensaje para el usuario: {@code 05/01/2027}, el mismo formato que el
 * frontend (spec 0008). No depende del locale de la JVM, que en la imagen de producción es en_US
 * (spec 0010).
 */
public final class DateFormatter {

    private static final DateTimeFormatter DAY_MONTH_YEAR = DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.ROOT);

    private DateFormatter() {
    }

    public static String format(LocalDate date) {
        return DAY_MONTH_YEAR.format(date);
    }
}
