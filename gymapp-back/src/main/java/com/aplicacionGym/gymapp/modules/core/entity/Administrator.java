package com.aplicacionGym.gymapp.modules.core.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name="core_administrator")
public class Administrator extends Person{

    public Administrator() {
    }

    public Administrator(Long id, String name, String lastName, String dni, String phone, String email, String password) {
        super(id, name, lastName, dni, phone, email, password);
    }

}
