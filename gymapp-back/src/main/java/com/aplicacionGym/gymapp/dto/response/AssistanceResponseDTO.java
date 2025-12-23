package com.aplicacionGym.gymapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssistanceResponseDTO {
    private Long idClient;
    private String clientName;
    private Long idProfessor;
    private String professorName;
    private LocalDate date;
    private LocalTime inputHour;
}