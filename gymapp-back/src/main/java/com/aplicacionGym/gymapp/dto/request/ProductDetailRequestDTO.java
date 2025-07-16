package com.aplicacionGym.gymapp.dto.request;

public class ProductDetailRequestDTO {

    private Long idProduct;
    private int quantity;
    private Double unitPrice;

    public ProductDetailRequestDTO() {
    }

    public ProductDetailRequestDTO(Long idProduct, int quantity, Double unitPrice) {
        this.idProduct = idProduct;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public Long getIdProduct() {
        return idProduct;
    }

    public void setIdProduct(Long idProduct) {
        this.idProduct = idProduct;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }
}
