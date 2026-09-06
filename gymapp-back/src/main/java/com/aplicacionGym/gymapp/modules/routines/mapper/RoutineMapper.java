package com.aplicacionGym.gymapp.modules.routines.mapper;

import com.aplicacionGym.gymapp.modules.routines.dto.request.RoutineRequestDTO;
import com.aplicacionGym.gymapp.modules.routines.dto.response.RoutineDayResponseDTO;
import com.aplicacionGym.gymapp.modules.routines.dto.response.RoutineExerciseResponseDTO;
import com.aplicacionGym.gymapp.modules.routines.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.modules.routines.dto.response.RoutineSummaryResponseDTO;
import com.aplicacionGym.gymapp.modules.routines.entity.Routine;
import com.aplicacionGym.gymapp.modules.routines.entity.RoutineDay;
import com.aplicacionGym.gymapp.modules.routines.entity.RoutineExercise;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface RoutineMapper {
    RoutineResponseDTO toDTO(Routine routine);

    RoutineDayResponseDTO mapRoutineDayToDTO(RoutineDay day);

    @Mapping(source = "exercise.name", target = "exerciseName")
    RoutineExerciseResponseDTO mapRoutineExerciseToDTO(RoutineExercise re);

    RoutineSummaryResponseDTO mapRoutineSummary(Routine routine);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "days", ignore = true)
    void updateEntityFromDto(RoutineRequestDTO dto, @MappingTarget Routine entity);
}
