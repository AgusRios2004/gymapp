package com.aplicacionGym.gymapp.modules.clients.repository;

import com.aplicacionGym.gymapp.modules.clients.entity.ClientSchedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientScheduleRepository extends JpaRepository<ClientSchedule, Long> {
}
