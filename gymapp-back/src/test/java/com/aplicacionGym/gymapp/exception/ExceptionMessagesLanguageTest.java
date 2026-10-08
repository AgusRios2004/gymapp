package com.aplicacionGym.gymapp.exception;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Spec 0015 (BUG-26): el frontend muestra literal el mensaje de las excepciones, así que tienen
 * que estar en español. Este test recorre src/main/java y falla si el texto de una excepción
 * vuelve a traer una de las expresiones en inglés que se sacaron. Es una lista, no un detector de
 * idioma: los textos de hoy los cubren los tests por endpoint de la misma spec.
 */
class ExceptionMessagesLanguageTest {

    // Desde "new XxxException(" hasta el ";" que cierra la sentencia: el literal puede estar en la
    // línea siguiente o partido en varios trozos concatenados.
    private static final Pattern EXCEPCION = Pattern.compile("new\\s+\\w*Exception\\s*\\([^;]*;");

    private static final Pattern LITERAL = Pattern.compile("\"((?:[^\"\\\\]|\\\\.)*)\"");

    private static final Pattern EN_INGLES = Pattern.compile(
            "\\b(not found|not exists|cannot|invalid|duplicate|in use|is assigned|have registers)\\b",
            Pattern.CASE_INSENSITIVE);

    // Login: sus mensajes no llegan al usuario (LoginPage muestra un texto propio) y cambiarlos va
    // con el status del login, fuera de alcance de la spec 0015.
    private static final Set<String> PERMITIDOS = Set.of("service/AuthService.java", "security/CustomUserDetailsService.java");

    @Test
    @DisplayName("AC-0015-13: ningún mensaje de excepción trae las expresiones en inglés que sacó la spec 0015")
    void ac_0015_13_ningunMensajeDeExcepcionEstaEnIngles() throws IOException {
        Path raiz = Path.of("src/main/java/com/aplicacionGym/gymapp");
        List<String> violaciones = new ArrayList<>();

        try (Stream<Path> archivos = Files.walk(raiz)) {
            for (Path archivo : archivos.filter(p -> p.toString().endsWith(".java")).toList()) {
                String relativo = raiz.relativize(archivo).toString().replace('\\', '/');
                if (PERMITIDOS.contains(relativo)) {
                    continue;
                }
                String codigo = Files.readString(archivo);
                Matcher excepcion = EXCEPCION.matcher(codigo);
                while (excepcion.find()) {
                    Matcher literal = LITERAL.matcher(excepcion.group());
                    while (literal.find()) {
                        if (EN_INGLES.matcher(literal.group(1)).find()) {
                            int linea = lineaDe(codigo, excepcion.start() + literal.start());
                            violaciones.add(relativo + ":" + linea + " → " + literal.group());
                        }
                    }
                }
            }
        }

        assertThat(violaciones)
                .as("Los mensajes de las excepciones van en español: el frontend los muestra tal cual (spec 0015)")
                .isEmpty();
    }

    private static int lineaDe(String codigo, int posicion) {
        return (int) codigo.substring(0, posicion).chars().filter(c -> c == '\n').count() + 1;
    }
}
