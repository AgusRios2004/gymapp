package com.aplicacionGym.gymapp.entity;

import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@Entity
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = true)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "professor_id")
    private Professor professor;

    @ManyToOne
    @JoinColumn(name = "monthly_type_id")
    private MonthlyType monthlyType;

    private double amount;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PaymentProduct> paymentProducts;

    public Payment(Long id, Client client, Professor professor, MonthlyType monthlyType, double amount, LocalDate date, PaymentType paymentType) {
        this.id = id;
        this.client = client;
        this.professor = professor;
        this.monthlyType = monthlyType;
        this.amount = amount;
        this.date = date;
        this.paymentType = paymentType;
    }

    public Payment(Long id, Client client, Professor professor, MonthlyType monthlyType, double amount, LocalDate date, PaymentType paymentType, List<PaymentProduct> paymentProducts) {
        this.id = id;
        this.client = client;
        this.professor = professor;
        this.monthlyType = monthlyType;
        this.amount = amount;
        this.date = date;
        this.paymentType = paymentType;
        this.paymentProducts = paymentProducts;
    }

    public LocalDate getExpirationDate() {
        if (this.date != null && this.monthlyType != null) {
            return this.date.plusDays(this.monthlyType.getDurationDays());
        }
        return null;
    }
}