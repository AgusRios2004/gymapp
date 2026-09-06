package com.aplicacionGym.gymapp.modules.clients.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PhysicalRecordRequestDTO {
    private LocalDate date;
    private Double weight;
    private Double muscleMass;
    private Double fatPercentage;
    private String notes;
}
