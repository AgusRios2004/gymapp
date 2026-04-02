package com.aplicacionGym.gymapp.mapper;

import com.aplicacionGym.gymapp.dto.response.*;
import com.aplicacionGym.gymapp.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class RoutineMapper {

    public static RoutineResponseDTO toDTO(Routine routine) {
        RoutineResponseDTO dto = new RoutineResponseDTO();
        dto.setId(routine.getId());
        dto.setName(routine.getName());
        dto.setGoal(routine.getGoal());
        dto.setActive(routine.isActive());

        List<RoutineDayResponseDTO> dayDTOs = routine.getDays()
                .stream()
                .map(RoutineMapper::mapRoutineDayToDTO)
                .collect(Collectors.toList());

        dto.setDays(dayDTOs);
        return dto;
    }

    private static RoutineDayResponseDTO mapRoutineDayToDTO(RoutineDay day) {
        RoutineDayResponseDTO dto = new RoutineDayResponseDTO();
        dto.setId(day.getId());
        dto.setDayOrder(day.getDayOrder());

        List<RoutineExerciseResponseDTO> exerciseDTOs = day.getExercises()
                .stream()
                .map(RoutineMapper::mapRoutineExerciseToDTO)
                .collect(Collectors.toList());

        dto.setExercises(exerciseDTOs);
        return dto;
    }

    private static RoutineExerciseResponseDTO mapRoutineExerciseToDTO(RoutineExercise re) {
        RoutineExerciseResponseDTO dto = new RoutineExerciseResponseDTO();
        dto.setId(re.getId());
        dto.setSets(re.getSets());
        dto.setRepetitions(re.getRepetitions());
        dto.setExerciseName(re.getExercise().getName()); // accede al nombre del ejercicio
        return dto;
    }

    public static RoutineSummaryResponseDTO mapRoutineSummary(Routine routine){
        if(routine == null) return null;
        return new RoutineSummaryResponseDTO(routine.getId(), routine.getName(), routine.getGoal());
    }
}
