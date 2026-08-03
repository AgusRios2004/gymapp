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
public class PhysicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    private LocalDate date;

    private Double weight;
    private Double height; // En metros (ej: 1.78) o cm (ej: 178)
    private Double muscleMass;
    private Double fatPercentage;

    @Column(length = 500)
    private String notes;

    public Double getBmi() {
        if (weight == null || height == null || height <= 0) {
            return null;
        }
        double heightInMeters = height > 3.0 ? height / 100.0 : height;
        return Math.round((weight / (heightInMeters * heightInMeters)) * 10.0) / 10.0;
    }
}
