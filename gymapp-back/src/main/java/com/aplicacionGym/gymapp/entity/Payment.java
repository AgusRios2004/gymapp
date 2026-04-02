package com.aplicacionGym.gymapp.entity;

import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Payment {

    // Getters y setters...
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private double amount;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    @ManyToOne(optional = true)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "professor_id")
    private Professor professor;

    @ManyToOne
    @JoinColumn(name = "monthly_type_id")
    private MonthlyType monthlyType;

    // CAMBIO PRINCIPAL: @OneToMany en lugar de @ManyToMany
    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PaymentProduct> paymentProducts;

    public LocalDate getExpirationDate() {
        if (this.date != null && this.monthlyType != null) {
            return this.date.plusDays(this.monthlyType.getDurationDays());
        }
        return null;
    }
}