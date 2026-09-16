package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.GroupClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupClassRepository extends JpaRepository<GroupClass, Long> {
}
