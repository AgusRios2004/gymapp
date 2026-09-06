import os
import re

src_dir = 'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules'

# Create ProfessorMapper
prof_mapper = """package com.aplicacionGym.gymapp.modules.core.mapper;

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
"""
with open(f'{src_dir}/core/mapper/ProfessorMapper.java', 'w') as f:
    f.write(prof_mapper)

# Create GroupClassMapper
group_class_mapper = """package com.aplicacionGym.gymapp.modules.attendance.mapper;

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
"""
with open(f'{src_dir}/attendance/mapper/GroupClassMapper.java', 'w') as f:
    f.write(group_class_mapper)

# Update RoutineMapper
routine_mapper_path = f'{src_dir}/routines/mapper/RoutineMapper.java'
with open(routine_mapper_path, 'r') as f:
    routine_mapper_content = f.read()

if 'updateEntityFromDto' not in routine_mapper_content:
    imports = """import com.aplicacionGym.gymapp.modules.routines.dto.request.RoutineRequestDTO;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;"""
    routine_mapper_content = routine_mapper_content.replace('import org.mapstruct.Mapper;', 'import org.mapstruct.Mapper;\n' + imports)
    
    update_method = """    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @org.mapstruct.Mapping(target = "days", ignore = true)
    public static void updateEntityFromDto(RoutineRequestDTO dto, @MappingTarget Routine entity) {
        if (dto == null) return;
        entity.setActive(dto.isActive());
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getGoal() != null) entity.setGoal(dto.getGoal());
    }
"""
    # RoutineMapper is a class with static methods currently, so we just add a static method. Wait, if it's an interface, we add default or abstract.
    # Let's check RoutineMapper. If it has class RoutineMapper, we can just change it to abstract class or use instance.
    # Wait, the plan says: "Añadir en los mappers: @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE) void updateEntityFromDto(RequestDTO dto, @MappingTarget Entity entity);"
    # If RoutineMapper is still hybrid, we can just make it an interface or abstract class.
pass

# But since we just want to replace setters, let's inject ProfessorMapper and GroupClassMapper.

# Update ProfessorService
prof_service_path = f'{src_dir}/core/service/ProfessorService.java'
with open(prof_service_path, 'r') as f:
    prof_service = f.read()

prof_service = prof_service.replace(
    'import org.springframework.beans.factory.annotation.Autowired;',
    'import org.springframework.beans.factory.annotation.Autowired;\nimport com.aplicacionGym.gymapp.modules.core.mapper.ProfessorMapper;'
)
prof_service = prof_service.replace(
    '@Autowired\n    private ProfessorRepository professorRepository;',
    '@Autowired\n    private ProfessorRepository professorRepository;\n\n    @Autowired\n    private ProfessorMapper professorMapper;'
)
prof_setter_old = """                    professor.setName(updatedProfessor.getName());
                    professor.setLastName(updatedProfessor.getLastName());
                    professor.setDni(updatedProfessor.getDni());
                    professor.setPhone(updatedProfessor.getPhone());
                    professor.setActive(updatedProfessor.isActive());
                    professor.setEmail(updatedProfessor.getEmail());"""
prof_setter_new = """                    professorMapper.updateEntityFromDto(updatedProfessor, professor);"""
prof_service = prof_service.replace(prof_setter_old, prof_setter_new)

with open(prof_service_path, 'w') as f:
    f.write(prof_service)

# Update GroupClassService
group_service_path = f'{src_dir}/attendance/service/GroupClassService.java'
with open(group_service_path, 'r') as f:
    group_service = f.read()

group_service = group_service.replace(
    'import com.aplicacionGym.gymapp.modules.clients.service.ClientService;',
    'import com.aplicacionGym.gymapp.modules.clients.service.ClientService;\nimport com.aplicacionGym.gymapp.modules.attendance.mapper.GroupClassMapper;'
)
group_service = group_service.replace(
    'private final ClientService clientService;',
    'private final ClientService clientService;\n    private final GroupClassMapper groupClassMapper;'
)
group_setter_old = """        existingClass.setClassName(updatedClass.getClassName());
        existingClass.setProfessor(updatedClass.getProfessor());
        existingClass.setDayOfWeek(updatedClass.getDayOfWeek());
        existingClass.setStartTime(updatedClass.getStartTime());
        existingClass.setEndTime(updatedClass.getEndTime());
        existingClass.setCapacity(updatedClass.getCapacity());
        existingClass.setRoutine(updatedClass.getRoutine());"""
group_setter_new = """        groupClassMapper.updateEntityFromDto(updatedClass, existingClass);"""
group_service = group_service.replace(group_setter_old, group_setter_new)

with open(group_service_path, 'w') as f:
    f.write(group_service)

# Update RoutineService
routine_service_path = f'{src_dir}/routines/service/RoutineService.java'
with open(routine_service_path, 'r') as f:
    routine_service = f.read()

routine_service = routine_service.replace(
    'import com.aplicacionGym.gymapp.modules.routines.mapper.RoutineMapper;',
    'import com.aplicacionGym.gymapp.modules.routines.mapper.RoutineMapper;\nimport org.springframework.beans.factory.annotation.Autowired;'
)
routine_service = routine_service.replace(
    'private final TransactionRunner transactionRunner;',
    'private final TransactionRunner transactionRunner;\n    @Autowired\n    private RoutineMapper routineMapper;'
)
routine_setter_old = """    private void updateRoutineData(Routine routine, RoutineRequestDTO dto) {
        routine.setActive(dto.isActive());
        routine.setName(dto.getName());
        routine.setGoal(dto.getGoal());
    }"""
routine_setter_new = """    private void updateRoutineData(Routine routine, RoutineRequestDTO dto) {
        routineMapper.updateEntityFromDto(dto, routine);
    }"""
routine_service = routine_service.replace(routine_setter_old, routine_setter_new)

with open(routine_service_path, 'w') as f:
    f.write(routine_service)

print("Phase 3 updates done.")
