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
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    private List<ClientRoutine> activeRoutines;

    private String name;

    @Column(name = "last_name")
    private String lastName;

    @Column(unique = true, nullable = false)
    private String dni;

    private String phone;

    private boolean active;

    @ManyToOne
    @JoinColumn(name = "routine_active_id")
    private Routine routineActive;

    @ManyToMany
    @JoinTable(
            name = "clients_routines",
            joinColumns = @JoinColumn(name = "client_id"),
            inverseJoinColumns = @JoinColumn(name = "routine_id")
    )
    private List<Routine> routines;

}
