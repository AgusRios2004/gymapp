package com.aplicacionGym.gymapp.mapper;

import com.aplicacionGym.gymapp.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.entity.Client;
import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    public static ClientResponseDTO toDTO(Client client) {
        ClientResponseDTO dto = new ClientResponseDTO();
        dto.setId(client.getId());
        dto.setDni(client.getDni());
        dto.setName(client.getName());
        dto.setPhone(client.getPhone());
        dto.setLastName(client.getLastName());
        dto.setActive(client.isActive());
        dto.setHeight(client.getHeight());
        dto.setTargetWeight(client.getTargetWeight());
        dto.setTargetFatPercentage(client.getTargetFatPercentage());
        dto.setTargetMuscleMass(client.getTargetMuscleMass());
        dto.setPrimaryGoal(client.getPrimaryGoal());
        
        dto.setRoutineActive(RoutineMapper.mapRoutineSummary(client.getRoutineActive()));
        if (client.getActiveClass() != null) {
            dto.setActiveClassId(client.getActiveClass().getId());
            dto.setActiveClassName(client.getActiveClass().getClassName());
        }

        // Calculate BMI if height and target weight or latest weight are available
        if (client.getHeight() != null && client.getHeight() > 0) {
            double heightMeters = client.getHeight() > 3.0 ? client.getHeight() / 100.0 : client.getHeight();
            if (client.getTargetWeight() != null && client.getTargetWeight() > 0) {
                double bmi = client.getTargetWeight() / (heightMeters * heightMeters);
                dto.setBmi(Math.round(bmi * 10.0) / 10.0);
            }
        }
        return dto;
    }
}

