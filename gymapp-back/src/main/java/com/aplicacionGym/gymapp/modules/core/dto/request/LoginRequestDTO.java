package com.aplicacionGym.gymapp.modules.core.dto.request;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String email;
    private String password;
}
