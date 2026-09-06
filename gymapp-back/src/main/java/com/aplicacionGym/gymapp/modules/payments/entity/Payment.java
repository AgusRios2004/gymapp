package com.aplicacionGym.gymapp.modules.payments.entity;

import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.core.entity.Professor;
import com.aplicacionGym.gymapp.modules.payments.entity.enums.PaymentType;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.envers.Audited;

import org.hibernate.envers.RelationTargetAuditMode;
import org.hibernate.envers.NotAudited;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="pay_payment")
@SQLDelete(sql = "UPDATE payment SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false")
@Audited
public class Payment {

    // Getters y setters...
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean deleted = false;

    private LocalDate date;
    private double amount;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    @ManyToOne(optional = true)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "professor_id")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Professor professor;

    @ManyToOne
    @JoinColumn(name = "monthly_type_id")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private MonthlyType monthlyType;

    // CAMBIO PRINCIPAL: @OneToMany en lugar de @ManyToMany
    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @NotAudited
    private List<PaymentProduct> paymentProducts;

    public LocalDate getExpirationDate() {
        if (this.date != null && this.monthlyType != null) {
            return this.date.plusDays(this.monthlyType.getDurationDays());
        }
        return null;
    }
}