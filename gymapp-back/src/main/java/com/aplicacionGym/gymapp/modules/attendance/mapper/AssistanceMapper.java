package com.aplicacionGym.gymapp.modules.attendance.mapper;

import com.aplicacionGym.gymapp.modules.attendance.dto.request.AssistanceRequestDTO;
import com.aplicacionGym.gymapp.modules.attendance.dto.response.AssistanceResponseDTO;
import com.aplicacionGym.gymapp.modules.attendance.entity.Assistance;
import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.core.entity.Person;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssistanceMapper {
    @Mapping(source = "client.id", target = "idClient")
    @Mapping(source = "client.name", target = "clientName")
    @Mapping(source = "staff.id", target = "idProfessor")
    @Mapping(source = "staff.name", target = "professorName")
    AssistanceResponseDTO toDTO(Assistance assistance);

    @Mapping(target = "client", source = "client")
    @Mapping(target = "staff", source = "staff")
    @Mapping(target = "date", source = "dto.date")
    @Mapping(target = "inputHour", source = "dto.inputHour")
    @Mapping(target = "id", ignore = true)
    Assistance toEntity(Client client, Person staff, AssistanceRequestDTO dto);
}
