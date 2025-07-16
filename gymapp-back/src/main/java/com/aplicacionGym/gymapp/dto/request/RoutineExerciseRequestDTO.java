package com.aplicacionGym.gymapp.dto.request;

public class RoutineExerciseRequestDTO {

    private Long idExercise;
    private int sets;
    private int repetitions;
    private double weight;

    public RoutineExerciseRequestDTO() {
    }

    public RoutineExerciseRequestDTO(Long idExercise, int repetitions, int sets, double weight) {
        this.idExercise = idExercise;
        this.repetitions = repetitions;
        this.sets = sets;
        this.weight = weight;
    }

    public Long getIdExercise() {
        return idExercise;
    }

    public void setIdExercise(Long idExercise) {
        this.idExercise = idExercise;
    }

    public int getRepetitions() {
        return repetitions;
    }

    public void setRepetitions(int repetitions) {
        this.repetitions = repetitions;
    }

    public int getSets() {
        return sets;
    }

    public void setSets(int sets) {
        this.sets = sets;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }
}
