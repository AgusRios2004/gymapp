package com.aplicacionGym.gymapp.entity;

import com.aplicacionGym.gymapp.entity.enums.ExerciseType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@Entity
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    @Column(name = "muscle_group")
    private String muscleGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "exercise_type")
    private ExerciseType type = ExerciseType.FUERZA_PESAS;

    public Exercise(Long id, String name, String muscleGroup, String description) {
        this.id = id;
        this.name = name;
        this.muscleGroup = muscleGroup;
        this.description = description;
        this.type = ExerciseType.FUERZA_PESAS;
    }

    public Exercise(Long id, String name, String muscleGroup, String description, ExerciseType type) {
        this.id = id;
        this.name = name;
        this.muscleGroup = muscleGroup;
        this.description = description;
        this.type = type != null ? type : ExerciseType.FUERZA_PESAS;
    }
}


