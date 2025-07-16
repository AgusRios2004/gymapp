package com.aplicacionGym.gymapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Administrator administrator;

    @Column(name = "product_name")
    private String productName;

    private double price;

    public Product() {
    }

    public Product(Long id, Administrator administrator, String productName, double price) {
        this.id = id;
        this.administrator = administrator;
        this.productName = productName;
        this.price = price;
    }

}
