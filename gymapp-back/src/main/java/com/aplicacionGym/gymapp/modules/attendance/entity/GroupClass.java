package com.aplicacionGym.gymapp.modules.attendance.entity;

import com.aplicacionGym.gymapp.modules.core.entity.Professor;
import com.aplicacionGym.gymapp.modules.routines.entity.Routine;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Entity
@Table(name="att_group_class")
public class GroupClass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String className;

    @ManyToOne
    @JoinColumn(name = "professor_id")
    private Professor professor;

    private String dayOfWeek; // e.g. "MONDAY"
    private String startTime; // e.g. "10:00"
    private String endTime; // e.g. "11:00"
    private int capacity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "routine_id", nullable = true)
    private Routine routine;
}
