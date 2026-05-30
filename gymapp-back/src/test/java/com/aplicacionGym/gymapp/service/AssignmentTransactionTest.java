package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.request.AssignRoutineRequestDTO;
import com.aplicacionGym.gymapp.dto.request.ScheduleRequestDTO;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.Routine;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.ClientRoutineRepository;
import com.aplicacionGym.gymapp.repository.RoutineRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class AssignmentTransactionTest {

    @Autowired
    private RoutineService routineService;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private RoutineRepository routineRepository;

    @Autowired
    private ClientRoutineRepository clientRoutineRepository;

    @Test
    void shouldRollbackAllIfScheduleFails() {
        // 1. Setup data
        Client client = new Client();
        client.setName("Test");
        client.setLastName("Client");
        client.setDni("12345678");
        client.setEmail("test@client.com");
        client.setPassword("password");
        client = clientRepository.save(client);

        Routine routine = new Routine();
        routine.setName("Template");
        routine = routineRepository.save(routine);

        long initialClientRoutines = clientRoutineRepository.count();

        // 2. Prepare request with INVALID schedule to trigger exception
        AssignRoutineRequestDTO request = new AssignRoutineRequestDTO();
        request.setClientId(client.getId());
        request.setRoutineTemplateId(routine.getId());
        
        ScheduleRequestDTO invalidSchedule = new ScheduleRequestDTO();
        invalidSchedule.setDayOrder(1);
        invalidSchedule.setAssignedDay("NOT_A_DAY"); // This will throw IllegalArgumentException in DayOfWeek.valueOf
        
        request.setSchedule(List.of(invalidSchedule));

        // 3. Execute and verify failure
        assertThrows(Exception.class, () -> {
            routineService.assignRoutineToClientComplex(request);
        });

        // 4. Check if ClientRoutine was rolled back (should not exist)
        assertEquals(initialClientRoutines, clientRoutineRepository.count(), "ClientRoutine should have been rolled back");
        
        Client updatedClient = clientRepository.findById(client.getId()).orElseThrow();
        assertNull(updatedClient.getRoutineActive(), "Client routineActive reference should have been rolled back");
    }
}
