package com.aplicacionGym.gymapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@Entity
public class Routine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany(mappedBy = "routines")
    private List<Client> clients;

    private String name;

    private String goal;

    private boolean active;

    @OneToMany(mappedBy = "routine", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoutineDay> days;

    public Routine() {
    }

    public Routine(Long id, List<RoutineDay> days, List<Client> clients, boolean active, String goal, String name) {
        this.id = id;
        this.days = days;
        this.clients = clients;
        this.active = active;
        this.goal = goal;
        this.name = name;
    }

}
