package com.aplicacionGym.gymapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Client extends Person {

    private boolean active;

    @ManyToOne
    @JoinColumn(name = "active_class_id")
    private GroupClass activeClass;

    @ManyToOne
    @JoinColumn(name = "routine_active_id")
    private Routine routineActive;

    @ManyToMany
    @JoinTable(name = "clients_routines", joinColumns = @JoinColumn(name = "client_id"), inverseJoinColumns = @JoinColumn(name = "routine_id"))
    private List<Routine> routines;

    public Client(Long id, String name, String lastName, String dni, String phone, String email, String password,
            boolean active, GroupClass activeClass, List<Routine> routines) {
        super(id, name, lastName, dni, phone, email, password);
        this.active = active;
        this.activeClass = activeClass;
        this.routines = routines;
    }
}
