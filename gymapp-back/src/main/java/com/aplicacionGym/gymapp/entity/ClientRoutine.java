package com.aplicacionGym.gymapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@Entity
public class ClientRoutine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "routine_id")
    private Routine routine;

    private boolean active;
    
    private LocalDate startDate;

    @OneToMany(mappedBy = "clientRoutine", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClientSchedule> schedule;
}