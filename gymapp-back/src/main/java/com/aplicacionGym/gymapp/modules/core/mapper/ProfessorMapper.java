package com.aplicacionGym.gymapp.modules.core.mapper;

import com.aplicacionGym.gymapp.modules.core.entity.Professor;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ProfessorMapper {
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(Professor dto, @MappingTarget Professor entity);
}
