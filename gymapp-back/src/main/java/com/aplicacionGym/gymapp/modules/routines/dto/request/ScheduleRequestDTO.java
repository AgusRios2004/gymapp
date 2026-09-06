package com.aplicacionGym.gymapp.modules.routines.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScheduleRequestDTO {
    private int dayOrder;
    private String assignedDay;
}
