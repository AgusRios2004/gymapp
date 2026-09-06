package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.modules.routines.dto.request.RoutineRequestDTO;
import com.aplicacionGym.gymapp.modules.routines.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.modules.routines.entity.Routine;
import com.aplicacionGym.gymapp.modules.routines.repository.RoutineRepository;
import com.aplicacionGym.gymapp.modules.routines.service.RoutineService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RoutineServiceVersioningTest {

    @Autowired
    private RoutineService routineService;

    @Autowired
    private RoutineRepository routineRepository;

    @Test
    void shouldCreateNewVersionOnUpdate() {
        // 1. Create initial routine
        RoutineRequestDTO createDto = new RoutineRequestDTO();
        createDto.setName("Version 1");
        createDto.setGoal("Goal 1");
        createDto.setActive(true);
        createDto.setDays(List.of());

        RoutineResponseDTO initialResponse = routineService.createRoutine(createDto);
        Long initialId = initialResponse.getId();

        // 2. Update routine
        RoutineRequestDTO updateDto = new RoutineRequestDTO();
        updateDto.setName("Version 2");
        updateDto.setGoal("Goal 2");
        updateDto.setActive(true);
        updateDto.setDays(List.of());

        RoutineResponseDTO updatedResponse = routineService.updateRoutine(initialId, updateDto);

        // 3. Verify
        assertNotEquals(initialId, updatedResponse.getId(), "Update should return a new ID (new version)");
        
        Routine oldVersion = routineRepository.findById(initialId).orElseThrow();
        assertFalse(oldVersion.isActive(), "Old version should be deactivated");
        assertEquals(1, oldVersion.getVersion());

        Routine newVersion = routineRepository.findById(updatedResponse.getId()).orElseThrow();
        assertTrue(newVersion.isActive());
        assertEquals(2, newVersion.getVersion());
        assertEquals(initialId, newVersion.getParentId());
    }
}
