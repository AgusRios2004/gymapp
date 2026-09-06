package com.aplicacionGym.gymapp.modules.routines.dto.request;

import com.aplicacionGym.gymapp.modules.clients.dto.request.ClientScheduleMapDTO;

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

