package com.aplicacionGym.gymapp.modules.clients.entity;

import com.aplicacionGym.gymapp.modules.attendance.entity.GroupClass;
import com.aplicacionGym.gymapp.modules.core.entity.Person;
import com.aplicacionGym.gymapp.modules.routines.entity.Routine;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

import org.hibernate.envers.Audited;

import org.hibernate.envers.RelationTargetAuditMode;
import org.hibernate.envers.NotAudited;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="cli_client")
@Audited
public class Client extends Person {

    private boolean active;

    @ManyToOne
    @JoinColumn(name = "active_class_id")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private GroupClass activeClass;

    @ManyToOne
    @JoinColumn(name = "routine_active_id")
    private Routine routineActive;

    @ManyToMany
    @JoinTable(name = "rout_clients_routines", joinColumns = @JoinColumn(name = "client_id"), inverseJoinColumns = @JoinColumn(name = "routine_id"))
    @NotAudited
    private List<Routine> routines;

    public Client(Long id, String name, String lastName, String dni, String phone, String email, String password,
            boolean active, GroupClass activeClass, List<Routine> routines) {
        super(id, name, lastName, dni, phone, email, password);
        this.active = active;
        this.activeClass = activeClass;
        this.routines = routines;
    }
}
