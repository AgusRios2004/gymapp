package com.aplicacionGym.gymapp.entity;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Assistance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Client client;

    @ManyToOne
    private Professor professor;

    private LocalDate date;

    @Column(name = "input_hour")
    private LocalTime inputHour;

    public Assistance(Client client, Professor professor, LocalDate date, LocalTime inputHour) {
        this.client = client;
        this.professor = professor;
        this.date = date;
        this.inputHour = inputHour;
    }

}


