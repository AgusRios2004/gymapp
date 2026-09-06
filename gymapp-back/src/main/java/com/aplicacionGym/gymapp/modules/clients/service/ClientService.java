package com.aplicacionGym.gymapp.modules.clients.service;

import com.aplicacionGym.gymapp.modules.attendance.entity.GroupClass;
import com.aplicacionGym.gymapp.modules.attendance.repository.GroupClassRepository;
import com.aplicacionGym.gymapp.modules.clients.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.clients.mapper.ClientMapper;
import com.aplicacionGym.gymapp.modules.clients.repository.ClientRepository;
import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.modules.payments.dto.response.ProductsPurchasedResponseDTO;
import com.aplicacionGym.gymapp.modules.payments.entity.Payment;
import com.aplicacionGym.gymapp.modules.payments.entity.PaymentProduct;
import com.aplicacionGym.gymapp.modules.payments.repository.PaymentProductRepository;
import com.aplicacionGym.gymapp.modules.payments.repository.PaymentRepository;
import com.aplicacionGym.gymapp.modules.routines.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.modules.routines.entity.Routine;
import com.aplicacionGym.gymapp.modules.routines.mapper.RoutineMapper;
import com.aplicacionGym.gymapp.modules.routines.repository.RoutineRepository;

import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientService {

    private final ClientRepository clientRepository;
    private final RoutineRepository routineRepository;
    private final PaymentProductRepository paymentProductRepository;
    private final PaymentRepository paymentRepository;
    private final GroupClassRepository groupClassRepository;
    private final ClientMapper clientMapper;
    private final RoutineMapper routineMapper;

    public ClientResponseDTO assignClass(Long idClient, Long idClass) {
        Objects.requireNonNull(idClient, "idClient cannot be null");
        Objects.requireNonNull(idClass, "idClass cannot be null");

        Client client = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + idClient));

        GroupClass groupClass = groupClassRepository.findById(idClass)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + idClass));

        client.setActiveClass(groupClass);
        clientRepository.save(client);

        return clientMapper.toDTO(client);
    }

    public ClientResponseDTO unassignClass(Long idClient) {
        Objects.requireNonNull(idClient, "idClient cannot be null");

        Client client = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + idClient));

        client.setActiveClass(null);
        clientRepository.save(client);

        return clientMapper.toDTO(client);
    }

    public ClientResponseDTO createClient(Client client) {
        if (client.getDni() != null) {
            client.setDni(client.getDni().trim());
        }

        clientRepository.findByDni(client.getDni())
                .ifPresent(existingClient -> {
                    throw new IllegalArgumentException("Client with DNI " + client.getDni() + " already exists.");
                });
        client.setActive(true);
        Client saved = clientRepository.save(client);
        return clientMapper.toDTO(saved);
    }

    public List<ClientResponseDTO> getAllClients() {
        return mapToDTOsWithDebtorStatus(clientRepository.findAll());
    }

    public List<ClientResponseDTO> getActiveClients() {
        return mapToDTOsWithDebtorStatus(clientRepository.findByActiveTrue());
    }

    public List<ClientResponseDTO> getInactiveClients() {
        return mapToDTOsWithDebtorStatus(clientRepository.findByActiveFalse());
    }

    public List<ClientResponseDTO> getDebtorClients() {
        List<Client> activeClients = clientRepository.findByActiveTrue();
        return mapToDTOsWithDebtorStatus(activeClients).stream()
                .filter(ClientResponseDTO::isDebtor)
                .toList();
    }

    public List<ClientResponseDTO> mapToDTOsWithDebtorStatus(List<Client> clients) {
        if (clients == null || clients.isEmpty()) {
            return List.of();
        }

        List<Long> activeClientIds = clients.stream()
                .filter(Client::isActive)
                .map(Client::getId)
                .toList();

        java.util.Map<Long, Payment> latestPaymentsMap = new java.util.HashMap<>();
        if (!activeClientIds.isEmpty()) {
            List<Payment> payments = paymentRepository.findLatestMonthlyPaymentsByClientIds(activeClientIds);
            for (Payment p : payments) {
                if (p.getClient() != null) {
                    latestPaymentsMap.put(p.getClient().getId(), p);
                }
            }
        }

        return clients.stream()
                .map(c -> {
                    ClientResponseDTO dto = clientMapper.toDTO(c);
                    if (c.isActive()) {
                        Payment lastPayment = latestPaymentsMap.get(c.getId());
                        if (lastPayment == null) {
                            dto.setDebtor(true);
                        } else {
                            LocalDate expirationDate = lastPayment.getExpirationDate();
                            dto.setDebtor(expirationDate == null || expirationDate.isBefore(LocalDate.now()));
                        }
                    }
                    return dto;
                })
                .toList();
    }

    public Optional<ClientResponseDTO> getClientById(Long id) {
        Objects.requireNonNull(id, "ID cannot be null");
        return clientRepository.findById(id)
                .map(clientMapper::toDTO);
    }

    public ClientResponseDTO updateClient(Long id, Client updatedClient) {
        Objects.requireNonNull(id, "ID cannot be null");
        Client existingClient = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        clientMapper.updateEntityFromDto(updatedClient, existingClient);

        clientRepository.save(existingClient);

        return clientMapper.toDTO(existingClient);
    }

    public void deactivateClient(Long id) {
        Objects.requireNonNull(id, "ID cannot be null");
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        if (!client.isActive()) {
            throw new ResourceNotFoundException("Client already desactivate");
        }

        client.setActive(false);
        clientRepository.save(client);
    }

    public ClientResponseDTO assignRoutine(Long idClient, Long idRoutine, boolean setAsActive) {
        Objects.requireNonNull(idClient, "idClient cannot be null");
        Objects.requireNonNull(idRoutine, "idRoutine cannot be null");
        Client saved = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + idClient));

        Routine routine = routineRepository.findById(idRoutine)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + idRoutine));

        if (!saved.getRoutines().contains(routine)) {
            saved.getRoutines().add(routine);
        }

        if (setAsActive) {
            saved.setRoutineActive(routine);
            log.info("Rutina activa seteada: {}", routine.getId());
        }

        Client client = clientRepository.save(saved);

        return clientMapper.toDTO(client);
    }

    public List<RoutineResponseDTO> getAllRoutinesByClient(Long idClient) {
        Objects.requireNonNull(idClient, "idClient cannot be null");
        Client client = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + idClient));
        return client.getRoutines().stream()
                .map(routineMapper::toDTO)
                .toList();
    }

    public ClientResponseDTO setActiveRoutine(Long idClient, Long idRoutine) {
        Objects.requireNonNull(idClient, "idClient cannot be null");
        Objects.requireNonNull(idRoutine, "idRoutine cannot be null");
        Client client = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + idClient));

        Routine routine = routineRepository.findById(idRoutine)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + idRoutine));

        client.setRoutineActive(routine);

        clientRepository.save(client);

        return clientMapper.toDTO(client);
    }

    public List<ProductsPurchasedResponseDTO> getProductsPurchasedByClient(Long id) {
        Objects.requireNonNull(id, "ID cannot be null");
        clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        List<PaymentProduct> paymentProducts = paymentProductRepository.findByClientId(id);
        return paymentProducts.stream().map(clientMapper::toProductsPurchasedResponseDTO).toList();

    }

}
