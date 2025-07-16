package com.aplicacionGym.gymapp.entity;

import jakarta.persistence.*;

@Entity
public class RoutineExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Exercise exercise;

    @ManyToOne
    private RoutineDay routineDay;

    private int sets;

    private int repetitions;

    public RoutineExercise() {
    }

    public RoutineExercise(Long id, Exercise exercise, RoutineDay routineDay, int repetitions, int sets) {
        this.id = id;
        this.exercise = exercise;
        this.routineDay = routineDay;
        this.repetitions = repetitions;
        this.sets = sets;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
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

    public RoutineDay getRoutineDay() {
        return routineDay;
    }

    public void setRoutineDay(RoutineDay routineDay) {
        this.routineDay = routineDay;
    }
}
