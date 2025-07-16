package com.aplicacionGym.gymapp.dto.request;

import java.time.DayOfWeek;
import java.util.List;

public class RoutineDayRequestDTO {

    private DayOfWeek day;
    private List<RoutineExerciseRequestDTO> exercises;

    public RoutineDayRequestDTO() {
    }

    public RoutineDayRequestDTO(DayOfWeek day, List<RoutineExerciseRequestDTO> exercises) {
        this.day = day;
        this.exercises = exercises;
    }

    public DayOfWeek getDay() {
        return day;
    }

    public void setDay(DayOfWeek day) {
        this.day = day;
    }

    public List<RoutineExerciseRequestDTO> getExercises() {
        return exercises;
    }

    public void setExercises(List<RoutineExerciseRequestDTO> exercises) {
        this.exercises = exercises;
    }
}
