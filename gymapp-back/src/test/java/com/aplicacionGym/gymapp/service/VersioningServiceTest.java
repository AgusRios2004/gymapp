package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.Routine;
import com.aplicacionGym.gymapp.entity.RoutineDay;
import com.aplicacionGym.gymapp.entity.RoutineExercise;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class VersioningServiceTest {

    @Autowired
    private VersioningService versioningService;

    @Test
    void shouldCreateDeepCloneWithIncrementedVersion() {
        Routine original = new Routine();
        original.setId(1L);
        original.setName("Original");
        original.setVersion(1);
        
        RoutineDay day = new RoutineDay();
        day.setDayOrder(1);
        day.setRoutine(original);
        
        RoutineExercise ex = new RoutineExercise();
        ex.setSets(3);
        ex.setRepetitions(10);
        ex.setRoutineDay(day);
        
        day.setExercises(new ArrayList<>(List.of(ex)));
        original.setDays(new ArrayList<>(List.of(day)));

        Routine clone = versioningService.cloneForNewVersion(original);

        assertNotNull(clone);
        assertNull(clone.getId(), "Clone ID must be null for new persistence");
        assertEquals(original.getId(), clone.getParentId(), "Parent ID must match original ID");
        assertEquals(2, clone.getVersion(), "Version must be incremented");
        assertEquals(original.getName(), clone.getName());
        
        assertEquals(1, clone.getDays().size());
        RoutineDay clonedDay = clone.getDays().get(0);
        assertNull(clonedDay.getId());
        assertSame(clone, clonedDay.getRoutine(), "Cloned day must point to cloned routine");
        
        assertEquals(1, clonedDay.getExercises().size());
        RoutineExercise clonedEx = clonedDay.getExercises().get(0);
        assertNull(clonedEx.getId());
        assertSame(clonedDay, clonedEx.getRoutineDay());
    }
}
