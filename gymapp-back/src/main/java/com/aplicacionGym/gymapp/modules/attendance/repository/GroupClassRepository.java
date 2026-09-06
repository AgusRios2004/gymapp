package com.aplicacionGym.gymapp.modules.attendance.repository;

import com.aplicacionGym.gymapp.modules.attendance.entity.GroupClass;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupClassRepository extends JpaRepository<GroupClass, Long> {
    List<GroupClass> findByDayOfWeek(String dayOfWeek);
}
