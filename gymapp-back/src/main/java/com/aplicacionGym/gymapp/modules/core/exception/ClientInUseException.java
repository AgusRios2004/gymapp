package com.aplicacionGym.gymapp.modules.core.exception;

public class ClientInUseException extends RuntimeException {
    public ClientInUseException(String message) {
        super(message);
    }
}
