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
public class MealLogResponseDTO {
    private Long id;
    private Long clientId;
    private LocalDate date;
    private String mealType;
    private String description;
    private Integer calories;
    private Integer proteinGrams;
    private boolean healthySnackReplaced;
}
