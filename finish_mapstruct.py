import os
import re

src_dir = 'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules'

# 1. Rewrite RoutineMapper.java
routine_mapper_content = """package com.aplicacionGym.gymapp.modules.routines.mapper;

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
"""
with open(f'{src_dir}/routines/mapper/RoutineMapper.java', 'w') as f:
    f.write(routine_mapper_content)

# 2. Update RoutineService to use instance of RoutineMapper and replace setter block
rs_path = f'{src_dir}/routines/service/RoutineService.java'
with open(rs_path, 'r') as f:
    rs_content = f.read()

if 'RoutineMapper routineMapper' not in rs_content:
    rs_content = rs_content.replace(
        'import org.springframework.stereotype.Service;',
        'import org.springframework.stereotype.Service;\nimport org.springframework.beans.factory.annotation.Autowired;'
    )
    rs_content = rs_content.replace(
        'private final TransactionRunner transactionRunner;',
        'private final TransactionRunner transactionRunner;\n    @Autowired\n    private RoutineMapper routineMapper;'
    )
    rs_content = rs_content.replace('RoutineMapper.toDTO', 'routineMapper.toDTO')
    rs_content = rs_content.replace('RoutineMapper::toDTO', 'routineMapper::toDTO')
    
    old_update = """    private void updateRoutineData(Routine routine, RoutineRequestDTO dto) {
        routine.setActive(dto.isActive());
        routine.setName(dto.getName());
        routine.setGoal(dto.getGoal());
    }"""
    new_update = """    private void updateRoutineData(Routine routine, RoutineRequestDTO dto) {
        routineMapper.updateEntityFromDto(dto, routine);
    }"""
    rs_content = rs_content.replace(old_update, new_update)

with open(rs_path, 'w') as f:
    f.write(rs_content)

# 3. Update ClientService (RoutineMapper usages and updateEntityFromDto usage)
cs_path = f'{src_dir}/clients/service/ClientService.java'
with open(cs_path, 'r') as f:
    cs_content = f.read()

if 'RoutineMapper routineMapper' not in cs_content:
    cs_content = cs_content.replace(
        'private final ClientMapper clientMapper;',
        'private final ClientMapper clientMapper;\n    private final RoutineMapper routineMapper;'
    )
    cs_content = cs_content.replace('RoutineMapper.toDTO', 'routineMapper.toDTO')
    cs_content = cs_content.replace('RoutineMapper::toDTO', 'routineMapper::toDTO')
    
    old_client_update = """        existingClient.setName(updatedClient.getName());
        existingClient.setLastName(updatedClient.getLastName());
        existingClient.setDni(updatedClient.getDni());
        existingClient.setPhone(updatedClient.getPhone());
        existingClient.setActive(updatedClient.isActive());"""
    # Since ClientService takes Client instead of DTO, MapStruct interface will have `void updateEntityFromEntity(Client dto, @MappingTarget Client entity);`
    new_client_update = """        clientMapper.updateEntityFromDto(updatedClient, existingClient);"""
    cs_content = cs_content.replace(old_client_update, new_client_update)
    
with open(cs_path, 'w') as f:
    f.write(cs_content)

# Update ClientMapper to support updateEntityFromDto with Client as DTO
cm_path = f'{src_dir}/clients/mapper/ClientMapper.java'
with open(cm_path, 'r') as f:
    cm_content = f.read()
if 'void updateEntityFromDto(Client dto' not in cm_content:
    cm_content = cm_content.replace(
        'void updateEntityFromDto(ClientRequestDTO dto, @MappingTarget Client entity);',
        'void updateEntityFromDto(Client dto, @MappingTarget Client entity);'
    )
with open(cm_path, 'w') as f:
    f.write(cm_content)

# 4. Create ProfessorMapper and GroupClassMapper if they don't exist
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
os.makedirs(f'{src_dir}/core/mapper', exist_ok=True)
with open(f'{src_dir}/core/mapper/ProfessorMapper.java', 'w') as f:
    f.write(prof_mapper)

group_mapper = """package com.aplicacionGym.gymapp.modules.attendance.mapper;

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
os.makedirs(f'{src_dir}/attendance/mapper', exist_ok=True)
with open(f'{src_dir}/attendance/mapper/GroupClassMapper.java', 'w') as f:
    f.write(group_mapper)

# Update ProfessorService
ps_path = f'{src_dir}/core/service/ProfessorService.java'
with open(ps_path, 'r') as f:
    ps_content = f.read()
if 'ProfessorMapper professorMapper' not in ps_content:
    ps_content = ps_content.replace(
        'import org.springframework.beans.factory.annotation.Autowired;',
        'import org.springframework.beans.factory.annotation.Autowired;\nimport com.aplicacionGym.gymapp.modules.core.mapper.ProfessorMapper;'
    )
    ps_content = ps_content.replace(
        '@Autowired\n    private ProfessorRepository professorRepository;',
        '@Autowired\n    private ProfessorRepository professorRepository;\n\n    @Autowired\n    private ProfessorMapper professorMapper;'
    )
    old_prof_update = """                    professor.setName(updatedProfessor.getName());
                    professor.setLastName(updatedProfessor.getLastName());
                    professor.setDni(updatedProfessor.getDni());
                    professor.setPhone(updatedProfessor.getPhone());
                    professor.setActive(updatedProfessor.isActive());
                    professor.setEmail(updatedProfessor.getEmail());"""
    new_prof_update = """                    professorMapper.updateEntityFromDto(updatedProfessor, professor);"""
    ps_content = ps_content.replace(old_prof_update, new_prof_update)
with open(ps_path, 'w') as f:
    f.write(ps_content)

# Update GroupClassService
gc_path = f'{src_dir}/attendance/service/GroupClassService.java'
with open(gc_path, 'r') as f:
    gc_content = f.read()
if 'GroupClassMapper groupClassMapper' not in gc_content:
    gc_content = gc_content.replace(
        'import com.aplicacionGym.gymapp.modules.clients.service.ClientService;',
        'import com.aplicacionGym.gymapp.modules.clients.service.ClientService;\nimport com.aplicacionGym.gymapp.modules.attendance.mapper.GroupClassMapper;'
    )
    gc_content = gc_content.replace(
        'private final ClientService clientService;',
        'private final ClientService clientService;\n    private final GroupClassMapper groupClassMapper;'
    )
    old_gc_update = """        existingClass.setClassName(updatedClass.getClassName());
        existingClass.setProfessor(updatedClass.getProfessor());
        existingClass.setDayOfWeek(updatedClass.getDayOfWeek());
        existingClass.setStartTime(updatedClass.getStartTime());
        existingClass.setEndTime(updatedClass.getEndTime());
        existingClass.setCapacity(updatedClass.getCapacity());
        existingClass.setRoutine(updatedClass.getRoutine());"""
    new_gc_update = """        groupClassMapper.updateEntityFromDto(updatedClass, existingClass);"""
    gc_content = gc_content.replace(old_gc_update, new_gc_update)
with open(gc_path, 'w') as f:
    f.write(gc_content)

print("MapStruct standardization completed.")
