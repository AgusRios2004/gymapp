package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.service.ClientService;
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
    private ResponseEntity<WebApiResponse> createClient(@RequestBody Client client) {
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
        } else {
            dto = clientService.getAllClients();
        }

        // Filtramos la lista en el controlador si se pide por estado activo
        if (active != null) {
            dto = dto.stream()
                    .filter(c -> active.equals(c.isActive()))
                    .toList();
        }
        return ResponseEntity.ok(WebApiResponseBuilder.success("Clients found successfully", dto));
    }

    @GetMapping("/{id}")
    private ResponseEntity<WebApiResponse> getClientById(@PathVariable Long id) {
        ClientResponseDTO client = clientService.getClientById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Client retrieved successfully", client));
    }

    @PutMapping("/{id}")
    private ResponseEntity<WebApiResponse> updateClient(@PathVariable Long id, @RequestBody Client updatedClient) {
        ClientResponseDTO client = clientService.updateClient(id, updatedClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Client updated successfully", client));
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<WebApiResponse> deleteClient(@PathVariable Long id) {
        clientService.deactivateClient(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Client deleted successfully", null));
    }

    @PostMapping("/{idClient}/routines/{idRoutine}")
    private ResponseEntity<WebApiResponse> assignedRoutineToClient(@PathVariable Long idClient,
            @PathVariable Long idRoutine, @RequestParam(defaultValue = "false") boolean activeRoutine) {
        ClientResponseDTO client = clientService.assignRoutine(idClient, idRoutine, activeRoutine);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine assigned successfully", client));
    }

    @GetMapping("/{idClient}/routines")
    private ResponseEntity<WebApiResponse> getAllRoutinesByClient(@PathVariable Long idClient) {
        List<RoutineResponseDTO> routines = clientService.getAllRoutinesByClient(idClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routines founds successfully", routines));
    }

    @PostMapping("/{idClient}/active-routine/{idRoutine}")
    private ResponseEntity<WebApiResponse> setActiveRoutine(@PathVariable Long idClient, @PathVariable Long idRoutine) {
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
