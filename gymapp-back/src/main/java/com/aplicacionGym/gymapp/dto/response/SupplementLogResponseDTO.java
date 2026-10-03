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
public class SupplementLogResponseDTO {
    private Long id;
    private Long clientId;
    private LocalDate date;
    private boolean creatineTaken;
    private boolean proteinTaken;
    private String notes;
}
