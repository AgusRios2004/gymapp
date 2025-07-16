package com.aplicacionGym.gymapp.dto.request;

import java.time.LocalDate;
import java.util.List;

public class ProductPaymentRequestDTO {

    private Long idClient;
    private Long idProfessor;
    private List<ProductDetailRequestDTO> products;
    private LocalDate date;

    public ProductPaymentRequestDTO() {
    }

    public ProductPaymentRequestDTO(Long idClient, Long idProfessor, List<ProductDetailRequestDTO> products, LocalDate date) {
        this.idClient = idClient;
        this.idProfessor = idProfessor;
        this.products = products;
        this.date = date;
    }

    public Long getIdClient() {
        return idClient;
    }

    public void setIdClient(Long idClient) {
        this.idClient = idClient;
    }

    public Long getIdProfessor() {
        return idProfessor;
    }

    public void setIdProfessor(Long idProfessor) {
        this.idProfessor = idProfessor;
    }

    public List<ProductDetailRequestDTO> getProducts() {
        return products;
    }

    public void setProducts(List<ProductDetailRequestDTO> products) {
        this.products = products;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
