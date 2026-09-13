package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.request.ClientRequestDTO;
import com.aplicacionGym.gymapp.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.mapper.ClientMapper;
import com.aplicacionGym.gymapp.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @PostMapping
    public ResponseEntity<WebApiResponse> createClient(@Valid @RequestBody ClientRequestDTO dto) {
        Client client = ClientMapper.toEntity(dto);
        ClientResponseDTO created = clientService.createClient(client);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Cliente creado correctamente", created));
    }

    @GetMapping
    public ResponseEntity<WebApiResponse> getAllClients(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean debtors,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<ClientResponseDTO> paginatedClients = 
                clientService.getPaginatedClients(pageable, active, debtors, search);

        return ResponseEntity.ok(WebApiResponseBuilder.success("Clients found successfully", paginatedClients));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebApiResponse> getClientById(@PathVariable Long id) {
        ClientResponseDTO client = clientService.getClientById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Cliente encontrado correctamente", client));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebApiResponse> updateClient(@PathVariable Long id, @Valid @RequestBody ClientRequestDTO dto) {
        Client updatedClient = ClientMapper.toEntity(dto);
        ClientResponseDTO client = clientService.updateClient(id, updatedClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Cliente actualizado correctamente", client));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WebApiResponse> deleteClient(@PathVariable Long id) {
        clientService.deactivateClient(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Client deleted successfully", null));
    }

    @PostMapping("/{idClient}/routines/{idRoutine}")
    public ResponseEntity<WebApiResponse> assignedRoutineToClient(@PathVariable Long idClient,
            @PathVariable Long idRoutine, @RequestParam(defaultValue = "false") boolean activeRoutine) {
        ClientResponseDTO client = clientService.assignRoutine(idClient, idRoutine, activeRoutine);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine assigned successfully", client));
    }

    @GetMapping("/{idClient}/routines")
    public ResponseEntity<WebApiResponse> getAllRoutinesByClient(@PathVariable Long idClient) {
        List<RoutineResponseDTO> routines = clientService.getAllRoutinesByClient(idClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routines founds successfully", routines));
    }

    @PostMapping("/{idClient}/active-routine/{idRoutine}")
    public ResponseEntity<WebApiResponse> setActiveRoutine(@PathVariable Long idClient, @PathVariable Long idRoutine) {
        ClientResponseDTO client = clientService.setActiveRoutine(idClient, idRoutine);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine set as active successfully!", client));
    }

    @PostMapping("/{idClient}/assign-class/{idClass}")
    public ResponseEntity<WebApiResponse> assignClass(@PathVariable Long idClient, @PathVariable Long idClass) {
        ClientResponseDTO client = clientService.assignClass(idClient, idClass);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Class assigned successfully", client));
    }

    @DeleteMapping("/{idClient}/unassign-class")
    public ResponseEntity<WebApiResponse> unassignClass(@PathVariable Long idClient) {
        ClientResponseDTO client = clientService.unassignClass(idClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Class unassigned successfully", client));
    }

}
