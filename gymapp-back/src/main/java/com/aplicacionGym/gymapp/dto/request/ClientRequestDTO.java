package com.aplicacionGym.gymapp.dto.request;

import io.micrometer.common.lang.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClientRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 15, message = "El nombre debe tener entre 2 y 15 caracteres")
    private String name;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, max = 15, message = "El apellido debe tener entre 2 y 15 caracteres")
    private String lastName;

    @Size(min = 10, max = 15, message = "El teléfono debe tener entre 10 y 15 caracteres")
    private String phone;

    @NotBlank(message = "El DNI es obligatorio")
    @Size(min = 8, max = 8, message = "El DNI debe tener 8 caracteres")
    private String dni;

    @Nullable
    private String email;

    private boolean active;

    @Nullable
    private Long routineActiveId;

    @Nullable
    private Double height;

    @Nullable
    private Double targetWeight;

    @Nullable
    private Double targetFatPercentage;

    @Nullable
    private Double targetMuscleMass;

    @Nullable
    private String primaryGoal;

    // Trim al deserializar, antes de que corra @Valid: si no, @Size mide los espacios y rechaza
    // un DNI como " 12345678 " que la spec 0001 acepta.
    public void setDni(String dni) {
        this.dni = dni == null ? null : dni.trim();
    }
}