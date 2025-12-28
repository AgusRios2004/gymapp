package com.aplicacionGym.gymapp.repository;

import com.aplicacionGym.gymapp.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByDni(String dni);

    List<Client> findByActiveTrue();

    List<Client> findByActiveFalse();

    @Query("SELECT COUNT(c) > 0 FROM Client c JOIN c.routines r WHERE r.id = :routineId")
    boolean existsClientWithRoutine(@Param("routineId") Long routineId);

}
