package com.aplicacionGym.gymapp.modules.clients.dto.request;

import lombok.Data;

@Data
public class ClientScheduleMapDTO {
    private int dayOrder;
    private String assignedDay; // MONDAY, TUESDAY, etc.
}
