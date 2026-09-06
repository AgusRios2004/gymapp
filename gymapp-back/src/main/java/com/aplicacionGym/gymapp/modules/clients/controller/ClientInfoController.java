package com.aplicacionGym.gymapp.modules.clients.controller;

import com.aplicacionGym.gymapp.modules.attendance.dto.response.AssistanceResponseDTO;
import com.aplicacionGym.gymapp.modules.attendance.entity.Assistance;
import com.aplicacionGym.gymapp.modules.attendance.service.AssistanceService;
import com.aplicacionGym.gymapp.modules.clients.service.ClientService;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.modules.payments.dto.response.PaymentResponseDTO;
import com.aplicacionGym.gymapp.modules.payments.dto.response.ProductsPurchasedResponseDTO;
import com.aplicacionGym.gymapp.modules.payments.service.PaymentService;
import com.aplicacionGym.gymapp.modules.routines.dto.response.RoutineResponseDTO;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/clients-info-controller")
@RequiredArgsConstructor
public class ClientInfoController {

    private final ClientService clientService;
    private final PaymentService paymentService;
    private final AssistanceService assistanceService;

    @GetMapping("/{idClient}/assistance")
    private ResponseEntity<WebApiResponse> getAssistance(@PathVariable Long idClient){
        List<AssistanceResponseDTO> assistanceList = assistanceService.getAssistanceByClient(idClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Assistance founds successfully!", assistanceList));
    }

    @GetMapping("/{idClient}/payments")
    private ResponseEntity<WebApiResponse> getPayments(@PathVariable Long idClient){
        List<PaymentResponseDTO> payments = paymentService.getPaymentsByClient(idClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Payments founds successfully!", payments));
    }

    @GetMapping("/{idClient}/routines")
    private ResponseEntity<WebApiResponse> getRoutines(@PathVariable Long idClient){
        List<RoutineResponseDTO> routines = clientService.getAllRoutinesByClient(idClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Routines founds successfully!", routines));
    }

    @GetMapping("/{idClient}/products")
    private ResponseEntity<WebApiResponse> getProductsPurchased(@PathVariable Long idClient){
        List<ProductsPurchasedResponseDTO> products = clientService.getProductsPurchasedByClient(idClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Products purchased founds successfully!", products));
    }

}
