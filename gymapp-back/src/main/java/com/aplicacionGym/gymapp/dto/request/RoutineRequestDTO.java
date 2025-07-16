package com.aplicacionGym.gymapp.dto.request;

import java.util.List;

public class RoutineRequestDTO {

    private String name;
    private String goal;
    private boolean active;
    private List<RoutineDayRequestDTO> days;

    public RoutineRequestDTO() {
    }

    public RoutineRequestDTO(boolean active, String name, String goal, List<RoutineDayRequestDTO> days) {
        this.active = active;
        this.name = name;
        this.goal = goal;
        this.days = days;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<RoutineDayRequestDTO> getDays() {
        return days;
    }

    public void setDays(List<RoutineDayRequestDTO> days) {
        this.days = days;
    }

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}