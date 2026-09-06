package com.aplicacionGym.gymapp.modules.clients.controller;

import com.aplicacionGym.gymapp.modules.clients.dto.request.ClientRequestDTO;
import com.aplicacionGym.gymapp.modules.clients.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.clients.mapper.ClientMapper;
import com.aplicacionGym.gymapp.modules.clients.service.ClientService;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.modules.routines.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.modules.routines.entity.Routine;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;
    private final ClientMapper clientMapper;

    @PostMapping
    public ResponseEntity<WebApiResponse> createClient(@Valid @RequestBody ClientRequestDTO clientDTO) {
        Client client = clientMapper.toEntity(clientDTO);
        ClientResponseDTO created = clientService.createClient(client);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Client created successfully", created));
    }

    @GetMapping
    public ResponseEntity<WebApiResponse> getAllClients(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean debtors) {

        List<ClientResponseDTO> dto;

        if (Boolean.TRUE.equals(debtors)) {
            dto = clientService.getDebtorClients();
        } else if (active != null) {
            if (active) {
                dto = clientService.getActiveClients();
            } else {
                dto = clientService.getInactiveClients();
            }
        } else {
            dto = clientService.getAllClients();
        }
        return ResponseEntity.ok(WebApiResponseBuilder.success("Clients found successfully", dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebApiResponse> getClientById(@PathVariable Long id) {
        ClientResponseDTO client = clientService.getClientById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Client retrieved successfully", client));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebApiResponse> updateClient(@PathVariable Long id, @Valid @RequestBody ClientRequestDTO clientDTO) {
        Client updatedClient = clientMapper.toEntity(clientDTO);
        ClientResponseDTO client = clientService.updateClient(id, updatedClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Client updated successfully", client));
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
