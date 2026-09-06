package com.aplicacionGym.gymapp.modules.attendance.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


import com.aplicacionGym.gymapp.modules.attendance.entity.GroupClass;
import com.aplicacionGym.gymapp.modules.attendance.repository.GroupClassRepository;
import com.aplicacionGym.gymapp.modules.clients.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.modules.clients.repository.ClientRepository;
import com.aplicacionGym.gymapp.modules.clients.service.ClientService;
import com.aplicacionGym.gymapp.modules.attendance.mapper.GroupClassMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "gym.modules.attendance.enabled", havingValue = "true")
public class GroupClassService {

    private final GroupClassRepository groupClassRepository;
    private final ClientRepository clientRepository;
    private final ClientService clientService;
    private final GroupClassMapper groupClassMapper;

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
        groupClassMapper.updateEntityFromDto(updatedClass, existingClass);
        return groupClassRepository.save(existingClass);
    }
}
