package com.aplicacionGym.gymapp.dto.response;

public class PaymentProductResponseDTO {

    private Long idProduct;
    private String productName;
    private int quantity;
    private double unitPrice;

    public PaymentProductResponseDTO() {
    }

    public PaymentProductResponseDTO(Long idProduct, String productName, int quantity, double unitPrice) {
        this.idProduct = idProduct;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public Long getIdProduct() {
        return idProduct;
    }

    public void setIdProduct(Long idProduct) {
        this.idProduct = idProduct;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }
}
