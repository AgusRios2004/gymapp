package com.aplicacionGym.gymapp.modules.core.repository;

import com.aplicacionGym.gymapp.modules.core.entity.Administrator;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdministratorRepository extends JpaRepository<Administrator, Long> {
}
