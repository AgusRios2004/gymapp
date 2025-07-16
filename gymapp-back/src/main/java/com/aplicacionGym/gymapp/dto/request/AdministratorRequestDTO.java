package com.aplicacionGym.gymapp.dto.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AdministratorRequestDTO {

    private String name;
    private String lastName;
    private String dni;
    private String phone;
    private String email;
    private String password;

    public AdministratorRequestDTO() {
    }

    public AdministratorRequestDTO(String name, String lastName, String dni, String phone, String email, String password) {
        this.name = name;
        this.lastName = lastName;
        this.dni = dni;
        this.phone = phone;
        this.email = email;
        this.password = password;
    }

}
