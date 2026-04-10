package com.aplicacionGym.gymapp.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class AssignRoutineRequestDTO {
    private Long clientId;
    private Long routineTemplateId;
    private LocalDate startDate;
    private String notes;
    private List<ScheduleRequestDTO> schedule;
}
