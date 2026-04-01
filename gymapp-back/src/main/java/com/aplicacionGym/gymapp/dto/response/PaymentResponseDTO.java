package com.aplicacionGym.gymapp.dto.response;

import java.time.LocalDate;
import java.util.List;

public class PaymentResponseDTO {

    private Long id;
    private Long idCliente;
    private String clientName;
    private Long idProfessor;
    private String professorName;

    private LocalDate date;
    private Double amount;
    private String paymentType;

    private Long monthlyType;
    private String monthlyTypeName;
    private List<PaymentProductResponseDTO> products;

    public PaymentResponseDTO() {
    }

    public PaymentResponseDTO(Long id, Long idCliente, Long idProfessor, Double amount, LocalDate date,
            Long monthlyType, String paymentType, List<PaymentProductResponseDTO> products) {
        this.id = id;
        this.idCliente = idCliente;
        this.idProfessor = idProfessor;
        this.amount = amount;
        this.date = date;
        this.monthlyType = monthlyType;
        this.paymentType = paymentType;
        this.products = products;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public Long getIdProfessor() {
        return idProfessor;
    }

    public void setIdProfessor(Long idProfessor) {
        this.idProfessor = idProfessor;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getMonthlyType() {
        return monthlyType;
    }

    public void setMonthlyType(Long monthlyType) {
        this.monthlyType = monthlyType;
    }

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public List<PaymentProductResponseDTO> getProducts() {
        return products;
    }

    public void setProducts(List<PaymentProductResponseDTO> products) {
        this.products = products;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getProfessorName() {
        return professorName;
    }

    public void setProfessorName(String professorName) {
        this.professorName = professorName;
    }

    public String getMonthlyTypeName() {
        return monthlyTypeName;
    }

    public void setMonthlyTypeName(String monthlyTypeName) {
        this.monthlyTypeName = monthlyTypeName;
    }
}
