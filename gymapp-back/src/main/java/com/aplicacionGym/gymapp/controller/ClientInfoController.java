package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.*;
import com.aplicacionGym.gymapp.service.AssistanceService;
import com.aplicacionGym.gymapp.service.ClientService;
import com.aplicacionGym.gymapp.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/clients-info-controller")
public class ClientInfoController {

    @Autowired
    private ClientService clientService;
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private AssistanceService assistanceService;

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
