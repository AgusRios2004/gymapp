package com.aplicacionGym.gymapp.handler;

import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.exception.ClientInUseException;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<WebApiResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        WebApiResponse response = WebApiResponseBuilder.failure(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(ClientInUseException.class)
    public ResponseEntity<WebApiResponse> handleClientInUse(ClientInUseException ex) {
        WebApiResponse response = WebApiResponseBuilder.failure(ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<WebApiResponse> handleGeneralException(Exception ex) {
        WebApiResponse response = WebApiResponseBuilder.failure("Internal server error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
