package com.aplicacionGym.gymapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Entity
public class GroupClass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String className;

    @ManyToOne
    @JoinColumn(name = "professor_id")
    private Professor professor;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "group_class_days_of_week", joinColumns = @JoinColumn(name = "group_class_id"))
    @Column(name = "day_of_week")
    private List<String> daysOfWeek = new ArrayList<>();

    /**
     * Campo viejo (spec 0003): solo lo lee GroupClassDaysMigration para migrar clases que todavía no
     * tienen daysOfWeek. No viaja en la respuesta JSON.
     */
    @Deprecated
    @JsonIgnore
    @Column(name = "day_of_week")
    private String legacyDayOfWeek;

    private String startTime; // e.g. "10:00"
    private String endTime; // e.g. "11:00"
    private int capacity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "routine_id", nullable = true)
    private Routine routine;
}
