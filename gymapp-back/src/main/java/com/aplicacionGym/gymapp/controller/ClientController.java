package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.dto.request.ClientRequestDTO;
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
    public ResponseEntity<WebApiResponse> getAllClients(@RequestParam(required = false) Boolean active) {
        List<ClientResponseDTO> dto;
        if (active == null) {
            dto = clientService.getAllClients();
        } else if (active) {
            dto = clientService.getAllClients();
        } else {
            dto = clientService.getAllClients();
        }
        return ResponseEntity.ok(WebApiResponseBuilder.success("Clients foudns successfully", dto));
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
    private ResponseEntity<WebApiResponse> assignedRoutineToClient(@PathVariable Long idClient,@PathVariable Long idRoutine,@RequestParam(defaultValue = "false") boolean activeRoutine) {
        ClientResponseDTO client = clientService.assignRoutine(idClient, idRoutine, activeRoutine);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine assigned successfully", client));
    }


    @GetMapping("/{idClient}/routines")
    private ResponseEntity<WebApiResponse> getAllRoutinesByClient(@PathVariable Long idClient){
        List<RoutineResponseDTO> routines = clientService.getAllRoutinesByClient(idClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routines founds successfully", routines));
    }

    @PostMapping("/{idClient}/active-routine/{idRoutine}")
    private ResponseEntity<WebApiResponse> setActiveRoutine(@PathVariable Long idClient, @PathVariable Long idRoutine){
        ClientResponseDTO client = clientService.setActiveRoutine(idClient, idRoutine);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routine set as active successfully!", client));
    }

}
