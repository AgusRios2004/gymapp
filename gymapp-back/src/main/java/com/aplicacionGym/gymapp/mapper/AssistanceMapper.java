package com.aplicacionGym.gymapp.mapper;

import com.aplicacionGym.gymapp.dto.request.AssistanceRequestDTO;
import com.aplicacionGym.gymapp.dto.response.AssistanceResponseDTO;
import com.aplicacionGym.gymapp.entity.Assistance;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.Professor;
import org.springframework.stereotype.Component;

@Component
public class AssistanceMapper {

    public static AssistanceResponseDTO toDTO(Assistance assistance){
        AssistanceResponseDTO dto = new AssistanceResponseDTO();
        dto.setIdClient(assistance.getClient().getId());
        dto.setClientName(assistance.getClient().getName());
        dto.setIdProfessor(assistance.getProfessor().getId());
        dto.setProfessorName(assistance.getProfessor().getName());
        dto.setDate(assistance.getDate());
        dto.setInputHour(assistance.getInputHour());
        return dto;
    }

    public static Assistance toEntity(Client client, Professor professor, AssistanceRequestDTO dto){
        return new Assistance(client, professor, dto.getDate(), dto.getInputHour());
    }

}
