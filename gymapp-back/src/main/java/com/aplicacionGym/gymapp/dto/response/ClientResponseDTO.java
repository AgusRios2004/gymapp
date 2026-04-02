package com.aplicacionGym.gymapp.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class ClientResponseDTO {

    private Long id;
    private String name;
    private String lastName;
    private String dni;
    private String phone;
    private boolean active;
    private boolean isDebtor;
    private RoutineSummaryResponseDTO routineActive;

    public boolean isActive() {
        return active;
    }

    public boolean isDebtor() {
        return isDebtor;
    }

    public ClientResponseDTO(Long id, String name, String lastName, String dni, String phone, boolean active,
            boolean isDebtor, RoutineSummaryResponseDTO routineActive) {
        this.id = id;
        this.name = name;
        this.lastName = lastName;
        this.dni = dni;
        this.phone = phone;
        this.active = active;
        this.isDebtor = isDebtor;
        this.routineActive = routineActive;
    }
}
