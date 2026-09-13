package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.dto.response.ProductsPurchasedResponseDTO;
import com.aplicacionGym.gymapp.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.entity.PaymentProduct;
import com.aplicacionGym.gymapp.entity.Routine;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.mapper.ClientMapper;
import com.aplicacionGym.gymapp.mapper.RoutineMapper;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.PaymentProductRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import com.aplicacionGym.gymapp.repository.RoutineRepository;
import com.aplicacionGym.gymapp.entity.Payment;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Objects;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private RoutineRepository routineRepository;
    @Autowired
    private PaymentProductRepository paymentProductRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private com.aplicacionGym.gymapp.repository.GroupClassRepository groupClassRepository;

    public ClientResponseDTO assignClass(Long idClient, Long idClass) {
        Objects.requireNonNull(idClient, "idClient cannot be null");
        Objects.requireNonNull(idClass, "idClass cannot be null");

        Client client = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + idClient));

        GroupClass groupClass = groupClassRepository.findById(idClass)
                .orElseThrow(() -> new ResourceNotFoundException("Clase no encontrada con id: " + idClass));

        client.setActiveClass(groupClass);
        clientRepository.save(client);

        return ClientMapper.toDTO(client);
    }

    public ClientResponseDTO unassignClass(Long idClient) {
        Objects.requireNonNull(idClient, "idClient cannot be null");

        Client client = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + idClient));

        client.setActiveClass(null);
        clientRepository.save(client);

        return ClientMapper.toDTO(client);
    }

    public ClientResponseDTO createClient(Client client) {
        if (client.getDni() != null) {
            client.setDni(client.getDni().trim());
        }

        clientRepository.findByDni(client.getDni())
                .ifPresent(existingClient -> {
                    throw new IllegalArgumentException("Ya existe un cliente con el DNI " + client.getDni() + ".");
                });
        client.setActive(true);
        Client saved = clientRepository.save(client);
        return ClientMapper.toDTO(saved);
    }

    public List<ClientResponseDTO> getAllClients() {
        return clientRepository.findAll()
                .stream()
                .map(this::mapToDTOWithDebtorStatus)
                .toList();
    }

    public List<ClientResponseDTO> getActiveClients() {
        return clientRepository.findByActiveTrue()
                .stream()
                .map(this::mapToDTOWithDebtorStatus)
                .toList();
    }

    public List<ClientResponseDTO> getInactiveClients() {
        return clientRepository.findByActiveFalse()
                .stream()
                .map(this::mapToDTOWithDebtorStatus)
                .toList();
    }

    public List<ClientResponseDTO> getDebtorClients() {
        List<Client> activeClients = clientRepository.findByActiveTrue();
        return activeClients.stream()
                .map(this::mapToDTOWithDebtorStatus)
                .filter(ClientResponseDTO::isDebtor)
                .toList();
    }

    public org.springframework.data.domain.Page<ClientResponseDTO> getPaginatedClients(
            org.springframework.data.domain.Pageable pageable, 
            Boolean active, 
            Boolean debtors, 
            String search) {
        
        List<ClientResponseDTO> allDtos;

        if (Boolean.TRUE.equals(debtors)) {
            allDtos = getDebtorClients();
        } else if (Boolean.TRUE.equals(active)) {
            allDtos = getActiveClients();
        } else if (Boolean.FALSE.equals(active)) {
            allDtos = getInactiveClients();
        } else {
            allDtos = getAllClients();
        }

        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.trim().toLowerCase();
            allDtos = allDtos.stream()
                    .filter(c -> (c.getName() != null && c.getName().toLowerCase().contains(lowerSearch)) ||
                                 (c.getLastName() != null && c.getLastName().toLowerCase().contains(lowerSearch)) ||
                                 (c.getDni() != null && c.getDni().contains(lowerSearch)))
                    .toList();
        }

        int start = (int) pageable.getOffset();
        if (start >= allDtos.size()) {
            return new org.springframework.data.domain.PageImpl<>(List.of(), pageable, allDtos.size());
        }
        int end = Math.min((start + pageable.getPageSize()), allDtos.size());
        List<ClientResponseDTO> pageContent = allDtos.subList(start, end);

        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, allDtos.size());
    }

    private ClientResponseDTO mapToDTOWithDebtorStatus(Client c) {
        ClientResponseDTO dto = ClientMapper.toDTO(c);
        if (c.isActive()) {
            // OPTIMIZACIÓN: Solo buscamos el pago si el cliente está activo
            Optional<Payment> lastPayment = paymentRepository
                    .findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(c.getId());
            
            if (lastPayment.isEmpty()) {
                dto.setDebtor(true);
            } else {
                LocalDate expirationDate = lastPayment.get().getExpirationDate();
                dto.setDebtor(expirationDate == null || expirationDate.isBefore(LocalDate.now()));
            }
        }
        return dto;
    }

    public Optional<ClientResponseDTO> getClientById(Long id) {
        Objects.requireNonNull(id, "ID cannot be null");
        return clientRepository.findById(id)
                .map(ClientMapper::toDTO);
    }

    public ClientResponseDTO updateClient(Long id, Client updatedClient) {
        Objects.requireNonNull(id, "ID cannot be null");
        Client existingClient = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));

        existingClient.setName(updatedClient.getName());
        existingClient.setLastName(updatedClient.getLastName());
        existingClient.setDni(updatedClient.getDni());
        existingClient.setPhone(updatedClient.getPhone());
        existingClient.setEmail(updatedClient.getEmail());
        existingClient.setActive(updatedClient.isActive());
        if (updatedClient.getHeight() != null) existingClient.setHeight(updatedClient.getHeight());
        if (updatedClient.getTargetWeight() != null) existingClient.setTargetWeight(updatedClient.getTargetWeight());
        if (updatedClient.getTargetFatPercentage() != null) existingClient.setTargetFatPercentage(updatedClient.getTargetFatPercentage());
        if (updatedClient.getTargetMuscleMass() != null) existingClient.setTargetMuscleMass(updatedClient.getTargetMuscleMass());
        if (updatedClient.getPrimaryGoal() != null) existingClient.setPrimaryGoal(updatedClient.getPrimaryGoal());

        clientRepository.save(existingClient);

        return ClientMapper.toDTO(existingClient);

    }

    public void deactivateClient(Long id) {
        Objects.requireNonNull(id, "ID cannot be null");
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));

        if (!client.isActive()) {
            throw new ResourceNotFoundException("El cliente ya está desactivado");
        }

        client.setActive(false);
        clientRepository.save(client);
    }

    public ClientResponseDTO assignRoutine(Long idClient, Long idRoutine, boolean setAsActive) {
        Objects.requireNonNull(idClient, "idClient cannot be null");
        Objects.requireNonNull(idRoutine, "idRoutine cannot be null");
        Client saved = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + idClient));

        Routine routine = routineRepository.findById(idRoutine)
                .orElseThrow(() -> new ResourceNotFoundException("Rutina no encontrada con id: " + idRoutine));

        if (!saved.getRoutines().contains(routine)) {
            saved.getRoutines().add(routine);
        }

        if (setAsActive) {
            saved.setRoutineActive(routine);
            System.out.println("Rutina activa seteada: " + routine.getId());
        }

        Client client = clientRepository.save(saved);

        return ClientMapper.toDTO(client);
    }

    public List<RoutineResponseDTO> getAllRoutinesByClient(Long idClient) {
        Objects.requireNonNull(idClient, "idClient cannot be null");
        Client client = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + idClient));
        return client.getRoutines().stream()
                .map(RoutineMapper::toDTO)
                .toList();
    }

    public ClientResponseDTO setActiveRoutine(Long idClient, Long idRoutine) {
        Objects.requireNonNull(idClient, "idClient cannot be null");
        Objects.requireNonNull(idRoutine, "idRoutine cannot be null");
        Client client = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + idClient));

        Routine routine = routineRepository.findById(idRoutine)
                .orElseThrow(() -> new ResourceNotFoundException("Rutina no encontrada con id: " + idRoutine));

        client.setRoutineActive(routine);

        clientRepository.save(client);

        return ClientMapper.toDTO(client);
    }

    public List<ProductsPurchasedResponseDTO> getProductsPurchasedByClient(Long id) {
        Objects.requireNonNull(id, "ID cannot be null");
        clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
        List<PaymentProduct> paymentProducts = paymentProductRepository.findByClientId(id);
        return paymentProducts.stream().map(purchase -> {
            ProductsPurchasedResponseDTO dto = new ProductsPurchasedResponseDTO();
            dto.setNameProduct(purchase.getProduct().getProductName());
            dto.setPrice(purchase.getUnitPrice());
            dto.setQuantity(purchase.getQuantity());
            dto.setDate(purchase.getPayment().getDate());
            return dto;
        }).toList();

    }

}
