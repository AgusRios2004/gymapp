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
public class WaterLogResponseDTO {
    private Long id;
    private Long clientId;
    private LocalDate date;
    private Integer milliliters;
    private Integer targetMilliliters;
    private String notes;
}
