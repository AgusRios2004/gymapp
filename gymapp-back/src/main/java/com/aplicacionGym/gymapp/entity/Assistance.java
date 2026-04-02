package com.aplicacionGym.gymapp.entity;

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
    @JoinColumn(name = "staff_id")
    private Person staff;

    private LocalDate date;

    @Column(name = "input_hour")
    private LocalTime inputHour;

    public Assistance(Client client, Person staff, LocalDate date, LocalTime inputHour) {
        this.client = client;
        this.staff = staff;
        this.date = date;
        this.inputHour = inputHour;
    }

}
