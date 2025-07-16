package com.aplicacionGym.gymapp.exception;

public class ExerciseInUseException extends RuntimeException {
    public ExerciseInUseException(String message) {
        super(message);
    }
}
