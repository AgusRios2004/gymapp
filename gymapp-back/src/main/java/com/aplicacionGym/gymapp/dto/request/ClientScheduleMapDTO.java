package com.aplicacionGym.gymapp.dto.request;

import lombok.Data;

@Data
public class ClientScheduleMapDTO {
    private int dayOrder;
    private String assignedDay; // MONDAY, TUESDAY, etc.
}
