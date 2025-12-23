package com.aplicacionGym.gymapp.entity;

import jakarta.persistence.*;

import java.time.DayOfWeek;
import java.util.List;

@Entity
public class RoutineDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_week")
    private DayOfWeek day; // Enum: MONDAY, TUESDAY...

    @ManyToOne
    private Routine routine;

    @OneToMany(mappedBy = "routineDay", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoutineExercise> exercises;

    public RoutineDay() {
    }

    public RoutineDay(Long id, Routine routine, DayOfWeek day, List<RoutineExercise> exercises) {
        this.id = id;
        this.routine = routine;
        this.day = day;
        this.exercises = exercises;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DayOfWeek getDay() {
        return day;
    }

    public void setDay(DayOfWeek day) {
        this.day = day;
    }

    public List<RoutineExercise> getExercises() {
        return exercises;
    }

    public void setExercises(List<RoutineExercise> exercises) {
        this.exercises = exercises;
    }

    public Routine getRoutine() {
        return routine;
    }

    public void setRoutine(Routine routine) {
        this.routine = routine;
    }
}
