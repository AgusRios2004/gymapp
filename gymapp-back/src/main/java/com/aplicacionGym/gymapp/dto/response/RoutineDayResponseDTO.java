package com.aplicacionGym.gymapp.dto.response;

import java.util.List;

public class RoutineDayResponseDTO {
    private Long id;
    private Integer dayOrder;
    private List<RoutineExerciseResponseDTO> exercises;

    public RoutineDayResponseDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getDayOrder() {
        return dayOrder;
    }

    public void setDayOrder(Integer dayOrder) {
        this.dayOrder = dayOrder;
    }

    public List<RoutineExerciseResponseDTO> getExercises() {
        return exercises;
    }

    public void setExercises(List<RoutineExerciseResponseDTO> exercises) {
        this.exercises = exercises;
    }
}
