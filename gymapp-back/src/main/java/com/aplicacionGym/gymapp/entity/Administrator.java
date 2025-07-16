package com.aplicacionGym.gymapp.entity;

import jakarta.persistence.Entity;

@Entity
public class Administrator extends Person{

    public Administrator() {
    }

    public Administrator(Long id, String name, String lastName, String dni, String phone, String email, String password) {
        super(id, name, lastName, dni, phone, email, password);
    }

}
