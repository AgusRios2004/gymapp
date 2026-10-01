package com.aplicacionGym.gymapp.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class GroupClassResponseDTO {
    private Long id;
    private String className;
    private List<String> daysOfWeek;
    private String startTime;
    private String endTime;
    private int capacity;
    private ProfessorSummaryResponseDTO professor;
    private RoutineSummaryResponseDTO routine;
}
