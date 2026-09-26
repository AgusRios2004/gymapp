package com.aplicacionGym.gymapp.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

/**
 * Montos en pesos argentinos con la misma regla que {@code formatMoney} del frontend (spec 0009):
 * {@code $150.000} si es entero, {@code $1.234,50} si tiene centavos. No depende del locale de la
 * JVM, que en la imagen de producción es en_US (spec 0010).
 */
public final class MoneyFormatter {

    private static final DecimalFormatSymbols AR = DecimalFormatSymbols.getInstance(Locale.forLanguageTag("es-AR"));

    private MoneyFormatter() {
    }

    public static String format(double amount) {
        BigDecimal rounded = BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP);
        boolean whole = rounded.stripTrailingZeros().scale() <= 0;
        DecimalFormat pattern = new DecimalFormat(whole ? "#,##0" : "#,##0.00", AR);
        return "$" + pattern.format(rounded);
    }
}
