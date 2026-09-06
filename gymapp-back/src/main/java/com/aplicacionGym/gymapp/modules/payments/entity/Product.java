package com.aplicacionGym.gymapp.modules.payments.entity;

import com.aplicacionGym.gymapp.modules.core.entity.Administrator;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.envers.Audited;

import org.hibernate.envers.RelationTargetAuditMode;

@Setter
@Getter
@Entity
@Table(name="pay_product")
@SQLDelete(sql = "UPDATE product SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false")
@Audited
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean deleted = false;

    @ManyToOne
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Administrator administrator;

    @Column(name = "product_name")
    private String productName;

    private double price;

    private int stock;

    public Product() {
    }

    public Product(Long id, Administrator administrator, String productName, double price) {
        this.id = id;
        this.administrator = administrator;
        this.productName = productName;
        this.price = price;
    }

}
