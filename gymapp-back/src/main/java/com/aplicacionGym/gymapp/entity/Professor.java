package com.aplicacionGym.gymapp.entity;

import jakarta.persistence.Entity;

@Entity
public class Professor extends Person {

    private boolean active;

    public Professor() {
    }

    public Professor(boolean active) {
        this.active = active;
    }

    public Professor(Long id, String name, String lastName, String dni, String phone, String email, String password, boolean active) {
        super(id, name, lastName, dni, phone, email, password);
        this.active = active;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
