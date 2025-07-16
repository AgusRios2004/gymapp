package com.aplicacionGym.gymapp.exception;

public class ClientInUseException extends RuntimeException {
    public ClientInUseException(String message) {
        super(message);
    }
}
