package com.aplicacionGym.gymapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class MealLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    private LocalDate date;
    private String mealType; // DESAYUNO, ALMUERZO, MERIENDA, CENA, SNACK

    @Column(length = 500)
    private String description;

    private Integer calories;
    private Integer proteinGrams;
    private boolean healthySnackReplaced; // Reemplazo de ultraprocesados por frutos secos / fruta
}
