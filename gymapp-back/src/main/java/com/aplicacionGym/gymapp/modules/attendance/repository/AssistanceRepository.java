package com.aplicacionGym.gymapp.modules.attendance.repository;

import com.aplicacionGym.gymapp.modules.attendance.entity.Assistance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssistanceRepository extends JpaRepository<Assistance, Long> {

    List<Assistance> findByClientId(Long clientId);

    List<Assistance> findByDate(LocalDate date);
}
