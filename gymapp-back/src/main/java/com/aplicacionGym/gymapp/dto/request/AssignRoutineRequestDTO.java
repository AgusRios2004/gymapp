package com.aplicacionGym.gymapp.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class AssignRoutineRequestDTO {
    private Long clientId;
    private Long routineTemplateId;
    private LocalDate startDate;
    private String notes;
    private List<ScheduleRequestDTO> schedule;
}

