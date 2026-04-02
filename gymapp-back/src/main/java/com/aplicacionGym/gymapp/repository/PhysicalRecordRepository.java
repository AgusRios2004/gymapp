package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.PhysicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhysicalRecordRepository extends JpaRepository<PhysicalRecord, Long> {
    List<PhysicalRecord> findByClientIdOrderByDateDesc(Long clientId);
}
