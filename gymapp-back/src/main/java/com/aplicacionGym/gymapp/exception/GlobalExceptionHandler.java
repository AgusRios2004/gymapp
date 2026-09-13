package com.aplicacionGym.gymapp.exception;

import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String MENSAJE_INESPERADO = "Error inesperado, intentá de nuevo.";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<WebApiResponse> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errores.merge(error.getField(), error.getDefaultMessage(), (a, b) -> a + " " + b));

        String message = String.join(" ", errores.values());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(WebApiResponseBuilder.failure(message, errores));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<WebApiResponse> handleMalformedJsonException(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(WebApiResponseBuilder.failure("El cuerpo de la solicitud no tiene un formato válido."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<WebApiResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(WebApiResponseBuilder.failure(mensajeOPorDefecto(ex.getMessage(), "Solicitud inválida.")));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<WebApiResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(WebApiResponseBuilder.failure(mensajeOPorDefecto(ex.getMessage(), "Recurso no encontrado.")));
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<WebApiResponse> handleBusinessRuleException(BusinessRuleException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(WebApiResponseBuilder.failure(mensajeOPorDefecto(ex.getMessage(), "No se pudo completar la operación.")));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<WebApiResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        logger.error("Violación de integridad de datos", ex);
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(WebApiResponseBuilder.failure("No se pudo completar la operación por un conflicto con los datos existentes."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<WebApiResponse> handleUnexpectedException(Exception ex) {
        logger.error("Error inesperado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(WebApiResponseBuilder.failure(MENSAJE_INESPERADO));
    }

    private String mensajeOPorDefecto(String mensaje, String porDefecto) {
        return (mensaje == null || mensaje.isBlank()) ? porDefecto : mensaje;
    }
}
