package com.aplicacionGym.gymapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.DayOfWeek;

@Getter @Setter
@NoArgsConstructor
@Entity
public class ClientSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_routine_id")
    private ClientRoutine clientRoutine;

    // Conecta con RoutineDay.dayOrder
    // Ej: El "Día 1" de la rutina...
    @Column(name = "day_order")
    private int dayOrder; 

    // ...el cliente lo hará el JUEVES
    @Enumerated(EnumType.STRING)
    @Column(name = "assigned_day")
    private DayOfWeek assignedDay;
    
    public ClientSchedule(ClientRoutine clientRoutine, int dayOrder, DayOfWeek assignedDay) {
        this.clientRoutine = clientRoutine;
        this.dayOrder = dayOrder;
        this.assignedDay = assignedDay;
    }
}