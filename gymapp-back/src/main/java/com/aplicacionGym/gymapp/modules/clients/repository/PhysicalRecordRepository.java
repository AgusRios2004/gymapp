package com.aplicacionGym.gymapp.modules.clients.repository;

import com.aplicacionGym.gymapp.modules.clients.entity.PhysicalRecord;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhysicalRecordRepository extends JpaRepository<PhysicalRecord, Long> {
    List<PhysicalRecord> findByClientIdOrderByDateDesc(Long clientId);
}
