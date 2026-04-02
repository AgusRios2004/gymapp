package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.request.AssistanceRequestDTO;
import com.aplicacionGym.gymapp.dto.response.AssistanceResponseDTO;
import com.aplicacionGym.gymapp.entity.Assistance;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.Person;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.mapper.AssistanceMapper;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.repository.AssistanceRepository;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.PersonRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AssistanceService {

    @Autowired
    private AssistanceRepository assistanceRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private PersonRepository personRepository;
    @Autowired
    private PaymentRepository paymentRepository;

    public AssistanceResponseDTO registerAssistance(AssistanceRequestDTO dto) {
        Client client = clientRepository.findById(dto.getIdClient())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + dto.getIdClient()));

        // CHECK: Latest monthly payment
        Payment latestPayment = paymentRepository
                .findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(client.getId())
                .orElseThrow(() -> new RuntimeException("El alumno no tiene una membresía registrada."));

        if (latestPayment.getExpirationDate() != null && latestPayment.getExpirationDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("La membresía del alumno ha vencido el: " + latestPayment.getExpirationDate());
        }

        Person staff = personRepository.findById(dto.getIdProfessor())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Staff member not found with id: " + dto.getIdProfessor()));

        Assistance assistance = AssistanceMapper.toEntity(client, staff, dto);
        assistance = assistanceRepository.save(assistance);
        return AssistanceMapper.toDTO(assistance);
    }

    public List<AssistanceResponseDTO> getAssistanceByClient(Long idClient) {
        List<Assistance> assistance = assistanceRepository.findByClientId(idClient);

        return assistance.stream()
                .map(AssistanceMapper::toDTO)
                .toList();
    }

    public List<AssistanceResponseDTO> getAssistanceByDate(LocalDate date) {
        List<Assistance> assistance = assistanceRepository.findByDate(date);

        return assistance.stream()
                .map(AssistanceMapper::toDTO)
                .toList();
    }

}
