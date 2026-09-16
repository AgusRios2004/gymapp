package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.repository.GroupClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aplicacionGym.gymapp.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.mapper.ClientMapper;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import com.aplicacionGym.gymapp.entity.Payment;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class GroupClassService {

    @Autowired
    private GroupClassRepository groupClassRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public List<GroupClass> getAllClasses() {
        return groupClassRepository.findAll();
    }

    public List<ClientResponseDTO> getStudentsByClass(Long id) {
        return clientRepository.findByActiveClassId(id)
                .stream()
                .map(client -> {
                    ClientResponseDTO dto = ClientMapper.toDTO(client);
                    dto.setDebtor(isDebtor(client.getId()));
                    return dto;
                })
                .toList();
    }

    private boolean isDebtor(Long clientId) {
        Optional<Payment> lastPayment = paymentRepository
                .findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(clientId);
        if (lastPayment.isEmpty())
            return true;
        LocalDate expirationDate = lastPayment.get().getExpirationDate();
        return expirationDate == null || expirationDate.isBefore(LocalDate.now());
    }

    private static final List<String> WEEKDAY_ORDER = List.of(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY");

    private List<String> normalizeDaysOfWeek(List<String> daysOfWeek) {
        if (daysOfWeek == null || daysOfWeek.isEmpty()) {
            throw new IllegalArgumentException("Debés seleccionar al menos un día para la clase.");
        }
        for (String day : daysOfWeek) {
            if (!WEEKDAY_ORDER.contains(day)) {
                throw new IllegalArgumentException("Día inválido: " + day);
            }
        }
        return WEEKDAY_ORDER.stream()
                .filter(new LinkedHashSet<>(daysOfWeek)::contains)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    public GroupClass createClass(GroupClass groupClass) {
        Objects.requireNonNull(groupClass, "GroupClass cannot be null");
        groupClass.setDaysOfWeek(normalizeDaysOfWeek(groupClass.getDaysOfWeek()));
        return groupClassRepository.save(groupClass);
    }

    public void deleteClass(Long id) {
        Objects.requireNonNull(id, "ID cannot be null");
        groupClassRepository.deleteById(id);
    }

    public GroupClass updateClass(Long id, GroupClass updatedClass) {
        GroupClass existingClass = groupClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la clase con id " + id));
        existingClass.setClassName(updatedClass.getClassName());
        existingClass.setProfessor(updatedClass.getProfessor());
        existingClass.setDaysOfWeek(normalizeDaysOfWeek(updatedClass.getDaysOfWeek()));
        existingClass.setStartTime(updatedClass.getStartTime());
        existingClass.setEndTime(updatedClass.getEndTime());
        existingClass.setCapacity(updatedClass.getCapacity());
        existingClass.setRoutine(updatedClass.getRoutine());
        return groupClassRepository.save(existingClass);
    }
}
