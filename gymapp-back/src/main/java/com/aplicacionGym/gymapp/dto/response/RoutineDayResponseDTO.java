package com.aplicacionGym.gymapp.dto.response;

import java.time.DayOfWeek;
import java.util.List;

public class RoutineDayResponseDTO {
    private Long id;
    private DayOfWeek day;
    private List<RoutineExerciseResponseDTO> exercises;

    public RoutineDayResponseDTO() {
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

    public List<RoutineExerciseResponseDTO> getExercises() {
        return exercises;
    }

    public void setExercises(List<RoutineExerciseResponseDTO> exercises) {
        this.exercises = exercises;
    }
}
