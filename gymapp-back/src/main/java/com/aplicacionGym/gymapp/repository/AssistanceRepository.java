package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.Assistance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssistanceRepository extends JpaRepository<Assistance, Long> {

    List<Assistance> findByClientId(Long clientId);

    List<Assistance> findByDate(LocalDate date);
}
