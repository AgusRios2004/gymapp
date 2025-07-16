package com.aplicacionGym.gymapp.mapper;

import com.aplicacionGym.gymapp.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.entity.Client;
import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    public static ClientResponseDTO toDTO(Client client){
        ClientResponseDTO dto = new ClientResponseDTO();
        dto.setId(client.getId());
        dto.setDni(client.getDni());
        dto.setName(client.getName());
        dto.setLastName(client.getLastName());
        dto.setActive(client.isActive());
        dto.setRoutineActive(RoutineMapper.mapRoutineSummary(client.getRoutineActive()));
        return dto;
    }

}
