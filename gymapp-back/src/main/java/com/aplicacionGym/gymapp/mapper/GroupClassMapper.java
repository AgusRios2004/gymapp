package com.aplicacionGym.gymapp.mapper;

import com.aplicacionGym.gymapp.dto.response.GroupClassResponseDTO;
import com.aplicacionGym.gymapp.dto.response.ProfessorSummaryResponseDTO;
import com.aplicacionGym.gymapp.dto.response.RoutineSummaryResponseDTO;
import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.entity.Routine;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

/**
 * Spec 0011: la entidad exponía el profesor completo (con el hash de la contraseña) y, vía
 * Routine.clients, un ciclo que dejaba el JSON inválido. Solo viajan los resúmenes.
 */
@Component
public class GroupClassMapper {

    public static GroupClassResponseDTO toDTO(GroupClass groupClass) {
        GroupClassResponseDTO dto = new GroupClassResponseDTO();
        dto.setId(groupClass.getId());
        dto.setClassName(groupClass.getClassName());
        dto.setDaysOfWeek(groupClass.getDaysOfWeek() == null ? null : new ArrayList<>(groupClass.getDaysOfWeek()));
        dto.setStartTime(groupClass.getStartTime());
        dto.setEndTime(groupClass.getEndTime());
        dto.setCapacity(groupClass.getCapacity());

        Professor professor = groupClass.getProfessor();
        if (professor != null) {
            dto.setProfessor(new ProfessorSummaryResponseDTO(professor.getId(), professor.getName(), professor.getLastName()));
        }

        Routine routine = groupClass.getRoutine();
        if (routine != null) {
            dto.setRoutine(new RoutineSummaryResponseDTO(routine.getId(), routine.getName(), routine.getGoal()));
        }
        return dto;
    }
}
