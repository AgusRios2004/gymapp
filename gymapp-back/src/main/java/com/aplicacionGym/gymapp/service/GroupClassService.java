package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.repository.GroupClassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.aplicacionGym.gymapp.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class GroupClassService {

    private final GroupClassRepository groupClassRepository;
    private final ClientRepository clientRepository;
    private final ClientService clientService;

    public List<GroupClass> getAllClasses() {
        return groupClassRepository.findAll();
    }

    public List<ClientResponseDTO> getStudentsByClass(Long id) {
        return clientService.mapToDTOsWithDebtorStatus(clientRepository.findByActiveClassId(id));
    }

    public GroupClass createClass(GroupClass groupClass) {
        Objects.requireNonNull(groupClass, "GroupClass cannot be null");
        return groupClassRepository.save(groupClass);
    }

    public void deleteClass(Long id) {
        Objects.requireNonNull(id, "ID cannot be null");
        groupClassRepository.deleteById(id);
    }

    public GroupClass updateClass(Long id, GroupClass updatedClass) {
        GroupClass existingClass = groupClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        existingClass.setClassName(updatedClass.getClassName());
        existingClass.setProfessor(updatedClass.getProfessor());
        existingClass.setDayOfWeek(updatedClass.getDayOfWeek());
        existingClass.setStartTime(updatedClass.getStartTime());
        existingClass.setEndTime(updatedClass.getEndTime());
        existingClass.setCapacity(updatedClass.getCapacity());
        existingClass.setRoutine(updatedClass.getRoutine());
        return groupClassRepository.save(existingClass);
    }
}
