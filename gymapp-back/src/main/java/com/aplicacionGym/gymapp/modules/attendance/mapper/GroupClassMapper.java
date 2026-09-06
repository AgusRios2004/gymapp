package com.aplicacionGym.gymapp.modules.attendance.mapper;

import com.aplicacionGym.gymapp.modules.attendance.entity.GroupClass;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface GroupClassMapper {
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(GroupClass dto, @MappingTarget GroupClass entity);
}
