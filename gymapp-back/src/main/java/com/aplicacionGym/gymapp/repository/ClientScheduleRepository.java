package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.ClientSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientScheduleRepository extends JpaRepository<ClientSchedule, Long> {
}
