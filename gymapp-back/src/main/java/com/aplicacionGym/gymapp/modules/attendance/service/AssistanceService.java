package com.aplicacionGym.gymapp.modules.attendance.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


import com.aplicacionGym.gymapp.modules.attendance.dto.request.AssistanceRequestDTO;
import com.aplicacionGym.gymapp.modules.attendance.dto.response.AssistanceResponseDTO;
import com.aplicacionGym.gymapp.modules.attendance.entity.Assistance;
import com.aplicacionGym.gymapp.modules.attendance.mapper.AssistanceMapper;
import com.aplicacionGym.gymapp.modules.attendance.repository.AssistanceRepository;
import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.clients.repository.ClientRepository;
import com.aplicacionGym.gymapp.modules.core.entity.Person;
import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.modules.core.repository.PersonRepository;
import com.aplicacionGym.gymapp.modules.core.service.BusinessRuleValidationService;
import com.aplicacionGym.gymapp.modules.payments.entity.Payment;
import com.aplicacionGym.gymapp.modules.payments.repository.PaymentRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@SuppressWarnings("null")
@ConditionalOnProperty(name = "gym.modules.attendance.enabled", havingValue = "true")
@RequiredArgsConstructor
public class AssistanceService {

    private final AssistanceRepository assistanceRepository;
    private final ClientRepository clientRepository;
    private final PersonRepository personRepository;
    private final PaymentRepository paymentRepository;
    private final BusinessRuleValidationService businessRuleValidationService;
    private final AssistanceMapper assistanceMapper;

    public AssistanceResponseDTO registerAssistance(AssistanceRequestDTO dto) {
        if (dto.getIdClient() == null || dto.getIdProfessor() == null) {
            throw new IllegalArgumentException("Client ID and Staff ID cannot be null");
        }

        Client client = clientRepository.findById(dto.getIdClient())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + dto.getIdClient()));

        // Check business rules
        businessRuleValidationService.validateClientAccess(client);

        Person staff = personRepository.findById(dto.getIdProfessor())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Staff member not found with id: " + dto.getIdProfessor()));

        Assistance assistance = assistanceMapper.toEntity(client, staff, dto);
        @SuppressWarnings("null")
        Assistance saved = assistanceRepository.save(assistance);
        return assistanceMapper.toDTO(saved);
    }

    public List<AssistanceResponseDTO> getAssistanceByClient(Long idClient) {
        List<Assistance> assistance = assistanceRepository.findByClientId(idClient);

        return assistance.stream()
                .map(assistanceMapper::toDTO)
                .toList();
    }

    public List<AssistanceResponseDTO> getAssistanceByDate(LocalDate date) {
        List<Assistance> assistance = assistanceRepository.findByDate(date);

        return assistance.stream()
                .map(assistanceMapper::toDTO)
                .toList();
    }

}
