package com.aplicacionGym.gymapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter @Setter
@NoArgsConstructor
@Entity
public class RoutineDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "day_order")
    private int dayOrder;

    @ManyToOne
    private Routine routine;

    @OneToMany(mappedBy = "routineDay", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoutineExercise> exercises;

    // Constructor limpio
    public RoutineDay(Routine routine, int dayOrder) {
        this.routine = routine;
        this.dayOrder = dayOrder;
    }
}