package com.aplicacionGym.gymapp.mapper;

import com.aplicacionGym.gymapp.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.dto.request.ClientRequestDTO;
import com.aplicacionGym.gymapp.entity.Client;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", imports = {RoutineMapper.class})
public interface ClientMapper {

    @Mapping(target = "routineActive", expression = "java(RoutineMapper.mapRoutineSummary(client.getRoutineActive()))")
    @Mapping(target = "activeClassId", source = "activeClass.id")
    @Mapping(target = "activeClassName", source = "activeClass.className")
    @Mapping(target = "debtor", ignore = true)
    ClientResponseDTO toDTO(Client client);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "activeClass", ignore = true)
    @Mapping(target = "routines", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "routineActive", ignore = true)
    Client toEntity(ClientRequestDTO dto);
}
