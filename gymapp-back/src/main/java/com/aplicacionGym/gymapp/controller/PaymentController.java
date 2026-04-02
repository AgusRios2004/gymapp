package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.request.MonthlyPaymentRequestDTO;
import com.aplicacionGym.gymapp.dto.request.ProductPaymentRequestDTO;
import com.aplicacionGym.gymapp.dto.response.PaymentResponseDTO;
import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

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