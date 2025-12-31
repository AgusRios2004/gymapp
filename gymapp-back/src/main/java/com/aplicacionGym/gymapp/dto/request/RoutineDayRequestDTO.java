package com.aplicacionGym.gymapp.dto.request;

import java.util.List;

public class RoutineDayRequestDTO {

    private Integer dayOrder;
    private List<RoutineExerciseRequestDTO> exercises;

    public RoutineDayRequestDTO() {
    }

    public RoutineDayRequestDTO(Integer dayOrder, List<RoutineExerciseRequestDTO> exercises) {
        this.dayOrder = dayOrder;
        this.exercises = exercises;
    }

    public Integer getDayOrder() {
        return dayOrder;
    }

    public void setDayOrder(Integer dayOrder) {
        this.dayOrder = dayOrder;
    }

    public List<RoutineExerciseRequestDTO> getExercises() {
        return exercises;
    }

    public void setExercises(List<RoutineExerciseRequestDTO> exercises) {
        this.exercises = exercises;
    }
}
