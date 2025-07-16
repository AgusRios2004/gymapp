package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.Administrator;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdministratorRepository extends JpaRepository<Administrator, Long> {
}
