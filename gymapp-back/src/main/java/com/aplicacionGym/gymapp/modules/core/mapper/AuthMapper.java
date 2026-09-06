package com.aplicacionGym.gymapp.modules.core.mapper;

import com.aplicacionGym.gymapp.modules.core.dto.response.LoginResponseDTO;
import com.aplicacionGym.gymapp.modules.core.entity.Person;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuthMapper {
    LoginResponseDTO toLoginResponseDTO(Person person);
}
