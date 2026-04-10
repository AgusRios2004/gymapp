package com.aplicacionGym.gymapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class ExerciseLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    private LocalDate date;

    // Métricas de carga
    private Double weight; // En kg o lbs
    private Integer repsAchieved;
    private Integer setsAchieved;

    // Métricas de tiempo/resistencia (ej: sprints, cardio, plancha)
    private Double timeInSeconds; 

    @Column(length = 500)
    private String notes;
}
