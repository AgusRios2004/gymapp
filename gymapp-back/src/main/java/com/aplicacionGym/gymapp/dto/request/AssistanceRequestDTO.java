package com.aplicacionGym.gymapp.dto.request;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssistanceRequestDTO {

    private Long idClient;
    private Long idProfessor;
    private LocalDate date;
    private LocalTime inputHour;

}
