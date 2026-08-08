package com.aplicacionGym.gymapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PhysicalRecordResponseDTO {
    private Long id;
    private LocalDate date;
    private Double weight;
    private Double height;
    private Double bmi;
    private Double muscleMass;
    private Double fatPercentage;
    private String notes;
}
