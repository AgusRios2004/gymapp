package com.aplicacionGym.gymapp.modules.payments.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.modules.core.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.modules.payments.dto.request.MonthlyPaymentRequestDTO;
import com.aplicacionGym.gymapp.modules.payments.dto.request.ProductPaymentRequestDTO;
import com.aplicacionGym.gymapp.modules.payments.dto.response.PaymentResponseDTO;
import com.aplicacionGym.gymapp.modules.payments.entity.Payment;
import com.aplicacionGym.gymapp.modules.payments.service.PaymentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@ConditionalOnProperty(name = "gym.modules.payments.enabled", havingValue = "true")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/monthly")
    private ResponseEntity<WebApiResponse> createMonthlyPayment(@RequestBody MonthlyPaymentRequestDTO dto) {
        PaymentResponseDTO paymentResponseDTO = paymentService.createMonthlyPayment(dto);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Payment register successfully!", paymentResponseDTO));
    }

    @PostMapping("/product")
    private ResponseEntity<WebApiResponse> createProductsPayment(@RequestBody ProductPaymentRequestDTO dto) {
        PaymentResponseDTO paymentResponseDTO = paymentService.createProductPayment(dto);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Payment register successfully!", paymentResponseDTO));
    }

    @GetMapping("/{idProfessor}")
    private ResponseEntity<WebApiResponse> getPaymentsByProfessor(@PathVariable Long idProfessor) {
        List<PaymentResponseDTO> paymentResponseDTOS = paymentService.getPaymentsByProfessor(idProfessor);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Payments founds successfully!", paymentResponseDTOS));
    }

    @GetMapping("/{idClient}")
    private ResponseEntity<WebApiResponse> getPaymentsByClient(@PathVariable Long idClient) {
        List<PaymentResponseDTO> paymentResponseDTOS = paymentService.getPaymentsByClient(idClient);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Payments founds successfully!", paymentResponseDTOS));
    }

    @GetMapping
    private ResponseEntity<WebApiResponse> getAllPayments() {
        List<PaymentResponseDTO> paymentResponseDTOS = paymentService.getAllPayments();
        return ResponseEntity.ok(WebApiResponseBuilder.success("Payments founds successfully!", paymentResponseDTOS));
    }
}