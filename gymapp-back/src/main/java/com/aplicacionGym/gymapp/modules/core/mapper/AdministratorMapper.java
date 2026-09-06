package com.aplicacionGym.gymapp.modules.core.mapper;

import com.aplicacionGym.gymapp.modules.core.dto.request.AdministratorRequestDTO;
import com.aplicacionGym.gymapp.modules.core.dto.response.AdministratorResponseDTO;
import com.aplicacionGym.gymapp.modules.core.entity.Administrator;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AdministratorMapper {
    AdministratorResponseDTO toDTO(Administrator administrator);
    Administrator toEntity(AdministratorRequestDTO dto);
}
