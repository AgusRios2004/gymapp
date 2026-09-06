package com.aplicacionGym.gymapp.modules.routines.entity;

import com.aplicacionGym.gymapp.modules.clients.entity.Client;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

@Setter
@Getter
@Entity
@Table(name="rout_routine")
@SQLDelete(sql = "UPDATE routine SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false")
@Audited
public class Routine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean deleted = false;

    @ManyToMany(mappedBy = "routines")
    @NotAudited
    private List<Client> clients;

    private String name;

    private String goal;

    private boolean active;

    private Integer version = 1;

    private Long parentId;

    @OneToMany(mappedBy = "routine", cascade = CascadeType.ALL, orphanRemoval = true)
    @NotAudited
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
