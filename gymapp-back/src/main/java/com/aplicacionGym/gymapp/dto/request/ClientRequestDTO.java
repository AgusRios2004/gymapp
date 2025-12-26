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
    
    @NotBlank(message = "Name cannot be blank")
    @Size(min = 4, max = 15, message = "Name must be between 4 and 15 characters")
    private String name;
    
    @NotBlank(message = "Last name cannot be blank")
    @Size(min = 4, max = 15, message = "Last name must be between 4 and 15 characters")
    private String lastName;
    
    @Size(min = 10, max = 15, message = "Phone must be between 7 and 15 characters")
    private String phone;

    @NotBlank(message = "DNI cannot be blank")
    @Size(min = 8, max = 8, message = "DNI must be 8 characters")
    private String dni;

    @Nullable
    private Long routineActiveId;
}