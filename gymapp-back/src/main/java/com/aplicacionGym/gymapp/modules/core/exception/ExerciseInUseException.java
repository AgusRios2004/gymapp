package com.aplicacionGym.gymapp.modules.core.exception;

public class ExerciseInUseException extends RuntimeException {
    public ExerciseInUseException(String message) {
        super(message);
    }
}
