package com.aplicacionGym.gymapp.dto.request;

import java.time.LocalDate;

public class MonthlyPaymentRequestDTO {

    private Long idClient;
    private Long idProfessor;
    private Long idMonthlyType;
    private LocalDate date;

    public MonthlyPaymentRequestDTO() {
    }

    public MonthlyPaymentRequestDTO(Long idClient, Long idMonthlyType, Long idProfessor, LocalDate date) {
        this.idClient = idClient;
        this.idMonthlyType = idMonthlyType;
        this.idProfessor = idProfessor;
        this.date = date;
    }

    public Long getIdClient() {
        return idClient;
    }

    public void setIdClient(Long idCliente) {
        this.idClient = idCliente;
    }

    public Long getIdMonthlyType() {
        return idMonthlyType;
    }

    public void setIdMonthlyType(Long idMonthlyType) {
        this.idMonthlyType = idMonthlyType;
    }

    public Long getIdProfessor() {
        return idProfessor;
    }

    public void setIdProfessor(Long idProfessor) {
        this.idProfessor = idProfessor;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
