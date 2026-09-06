package com.aplicacionGym.gymapp.modules.routines.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoutineSummaryResponseDTO {
    private Long id;
    private String name;
    private String goal;
}
