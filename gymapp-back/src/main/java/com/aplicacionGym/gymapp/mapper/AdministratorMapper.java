package com.aplicacionGym.gymapp.mapper;

import com.aplicacionGym.gymapp.dto.request.AdministratorRequestDTO;
import com.aplicacionGym.gymapp.dto.response.AdministratorResponseDTO;
import com.aplicacionGym.gymapp.entity.Administrator;
import org.springframework.stereotype.Component;

@Component
public class AdministratorMapper {

        public static AdministratorResponseDTO toDTO(Administrator administrator){
        AdministratorResponseDTO dto = new AdministratorResponseDTO();
            dto.setId(administrator.getId());
            dto.setName(administrator.getName());
            dto.setLastName(administrator.getLastName());
            dto.setDni(administrator.getDni());
            dto.setPhone(administrator.getPhone());
            dto.setEmail(administrator.getEmail());
            return dto;
        }

        public static Administrator toEntity(AdministratorRequestDTO dto){
            Administrator administrator = new Administrator();
            administrator.setName(dto.getName());
            administrator.setLastName(dto.getLastName());
            administrator.setPhone(dto.getPhone());
            administrator.setDni(dto.getDni());
            administrator.setEmail(dto.getEmail());
            administrator.setPassword(dto.getPassword());
            return administrator;
        }

}
