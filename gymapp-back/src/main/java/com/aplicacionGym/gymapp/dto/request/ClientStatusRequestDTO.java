package com.aplicacionGym.gymapp.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClientStatusRequestDTO {

    @NotNull(message = "El estado activo es obligatorio")
    private Boolean active;

}
