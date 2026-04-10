package com.aplicacionGym.gymapp.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class AssignRoutineRequestDTO {
    private Long clientId;
    private Long routineTemplateId;
    private String startDate;
    private String notes;
    private List<ClientScheduleMapDTO> schedule;
}
