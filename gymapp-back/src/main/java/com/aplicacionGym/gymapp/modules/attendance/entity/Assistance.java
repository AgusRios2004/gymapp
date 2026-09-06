package com.aplicacionGym.gymapp.modules.attendance.entity;

import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.core.entity.Person;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name="att_assistance")
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
