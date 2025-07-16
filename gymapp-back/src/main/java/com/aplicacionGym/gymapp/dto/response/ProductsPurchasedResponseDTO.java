package com.aplicacionGym.gymapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class ProductsPurchasedResponseDTO {
    private String nameProduct;
    private LocalDate date;
    private Double price;
    private int quantity;
}
