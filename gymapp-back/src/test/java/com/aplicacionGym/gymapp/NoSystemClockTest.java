package com.aplicacionGym.gymapp;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Spec 0010 / ADR-0011: todo "hoy" del backend sale del Clock del negocio. Este test recorre
 * src/main/java y falla si alguien vuelve a pedir la fecha a la zona de la JVM, en vez de confiar
 * en que la lista de servicios de la spec esté completa.
 */
class NoSystemClockTest {

    private static final Pattern SIN_RELOJ = Pattern.compile("\\b(LocalDate|LocalDateTime)\\.now\\(\\s*\\)");

    // Seeders: solo arman datos de desarrollo, un día de diferencia no afecta a nadie (spec 0010).
    private static final Set<String> PERMITIDOS = Set.of("config/DataLoader.java", "config/HeavyDataLoader.java");

    @Test
    @DisplayName("AC-0010-12: ningún código de negocio pide la fecha sin el reloj del negocio")
    void ac_0010_12_ningunCodigoDeNegocioPideLaFechaSinElRelojDelNegocio() throws IOException {
        Path raiz = Path.of("src/main/java/com/aplicacionGym/gymapp");
        List<String> violaciones = new ArrayList<>();

        try (Stream<Path> archivos = Files.walk(raiz)) {
            for (Path archivo : archivos.filter(p -> p.toString().endsWith(".java")).toList()) {
                String relativo = raiz.relativize(archivo).toString().replace('\\', '/');
                if (PERMITIDOS.contains(relativo)) {
                    continue;
                }
                List<String> lineas = Files.readAllLines(archivo);
                for (int i = 0; i < lineas.size(); i++) {
                    if (SIN_RELOJ.matcher(sinComentario(lineas.get(i))).find()) {
                        violaciones.add(relativo + ":" + (i + 1) + " → " + lineas.get(i).trim());
                    }
                }
            }
        }

        assertThat(violaciones)
                .as("Usá LocalDate.now(clock) / LocalDateTime.now(clock) con el Clock inyectado (ADR-0011)")
                .isEmpty();
    }

    // Las líneas de Javadoc y los comentarios pueden nombrar now() sin usarlo.
    private static String sinComentario(String linea) {
        String t = linea.trim();
        if (t.startsWith("*") || t.startsWith("/*") || t.startsWith("//")) {
            return "";
        }
        int comentario = linea.indexOf("//");
        return comentario >= 0 ? linea.substring(0, comentario) : linea;
    }
}
