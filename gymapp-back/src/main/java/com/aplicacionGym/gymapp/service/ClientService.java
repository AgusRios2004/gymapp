package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.dto.response.ProductsPurchasedResponseDTO;
import com.aplicacionGym.gymapp.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.PaymentProduct;
import com.aplicacionGym.gymapp.entity.Routine;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.mapper.ClientMapper;
import com.aplicacionGym.gymapp.mapper.RoutineMapper;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.PaymentProductRepository;
import com.aplicacionGym.gymapp.repository.RoutineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private RoutineRepository routineRepository;
    @Autowired
    private PaymentProductRepository paymentProductRepository;

    public Client createClient(Client client){
        return clientRepository.save(client);
    }

    public List<ClientResponseDTO> getAllClients() {
        return clientRepository.findAll()
                .stream()
                .map(ClientMapper::toDTO)
                .toList();
    }

    public List<ClientResponseDTO> getActiveClients() {
        return clientRepository.findByActiveTrue()
                .stream()
                .map(ClientMapper::toDTO)
                .toList();
    }

    public List<ClientResponseDTO> getInactiveClients() {
        return clientRepository.findByActiveFalse()
                .stream()
                .map(ClientMapper::toDTO)
                .toList();
    }

    public Optional<ClientResponseDTO> getClientById(Long id) {
        return clientRepository.findById(id)
                .map(ClientMapper :: toDTO);
    }

    public ClientResponseDTO updateClient(Long id, Client updatedClient) {
        Client existingClient = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        existingClient.setName(updatedClient.getName());
        existingClient.setLastName(updatedClient.getLastName());
        existingClient.setDni(updatedClient.getDni());
        existingClient.setPhone(updatedClient.getPhone());
        existingClient.setActive(updatedClient.isActive());

        clientRepository.save(existingClient);

        return ClientMapper.toDTO(existingClient);
    }

    public void deactivateClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        if (!client.isActive()) {
            throw new ResourceNotFoundException("Client already desactivate");
        }

        client.setActive(false);
        clientRepository.save(client);
    }


    public ClientResponseDTO assignRoutine(Long idClient, Long idRoutine, boolean setAsActive) {
        Client saved = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + idClient));

        Routine routine = routineRepository.findById(idRoutine)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + idRoutine));

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

    public List<RoutineResponseDTO> getAllRoutinesByClient(Long idClient){
        Client client = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: "+idClient));
        return client.getRoutines().stream()
            .map(RoutineMapper::toDTO)
            .toList();
    }

    public ClientResponseDTO setActiveRoutine(Long idClient, Long idRoutine){
        Client client = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + idClient));

        Routine routine = routineRepository.findById(idRoutine)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + idRoutine));

        client.setRoutineActive(routine);

        clientRepository.save(client);

        return ClientMapper.toDTO(client);
    }

    public List<ProductsPurchasedResponseDTO> getProductsPurchasedByClient(Long id){
        clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: "+id));
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
