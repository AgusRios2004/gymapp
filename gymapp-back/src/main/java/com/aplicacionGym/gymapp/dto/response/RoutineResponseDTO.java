package com.aplicacionGym.gymapp.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class RoutineResponseDTO {
    private Long id;
    private String name;
    private String goal;
    private boolean active;
    private List<RoutineDayResponseDTO> days;

    public RoutineResponseDTO() {
    }

}
