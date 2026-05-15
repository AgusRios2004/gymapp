package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.request.AssignRoutineRequestDTO;
import com.aplicacionGym.gymapp.dto.request.RoutineDayRequestDTO;
import com.aplicacionGym.gymapp.dto.request.RoutineRequestDTO;
import com.aplicacionGym.gymapp.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.entity.*;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.mapper.RoutineMapper;
import com.aplicacionGym.gymapp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@SuppressWarnings("null")
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final ExerciseRepository exerciseRepository;
    private final ClientRepository clientRepository;
    private final ClientRoutineRepository clientRoutineRepository;
    private final ClientScheduleRepository clientScheduleRepository;
    private final VersioningService versioningService;
    private final TransactionRunner transactionRunner;

    public RoutineService(RoutineRepository routineRepository,
            ExerciseRepository exerciseRepository,
            ClientRepository clientRepository,
            ClientRoutineRepository clientRoutineRepository,
            ClientScheduleRepository clientScheduleRepository,
            VersioningService versioningService,
            TransactionRunner transactionRunner) {
        this.routineRepository = routineRepository;
        this.exerciseRepository = exerciseRepository;
        this.clientRepository = clientRepository;
        this.clientRoutineRepository = clientRoutineRepository;
        this.clientScheduleRepository = clientScheduleRepository;
        this.versioningService = versioningService;
        this.transactionRunner = transactionRunner;
    }

    @Transactional
    public RoutineResponseDTO createRoutine(RoutineRequestDTO dto) {
        validateUniqueDays(dto.getDays());

        Routine routine = new Routine();
        updateRoutineData(routine, dto);

        List<RoutineDay> routineDays = mapDaysToRoutine(dto.getDays(), routine);
        routine.setDays(routineDays);

        return RoutineMapper.toDTO(routineRepository.save(routine));
    }

    @Transactional
    public List<RoutineResponseDTO> getAllRoutines() {
        return routineRepository.findAll().stream()
                .map(RoutineMapper::toDTO)
                .toList();
    }

    @Transactional
    public RoutineResponseDTO getRoutineById(Long id) {
        Routine routine = routineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + id));
        return RoutineMapper.toDTO(routine);
    }

    @Transactional
    public RoutineResponseDTO updateRoutine(Long id, RoutineRequestDTO routineRequestDTO) {
        validateUniqueDays(routineRequestDTO.getDays());

        Routine oldRoutine = routineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + id));
        
        // Deactivate old version
        oldRoutine.setActive(false);
        routineRepository.save(oldRoutine);

        // Create new version
        Routine newRoutine = versioningService.cloneForNewVersion(oldRoutine);
        updateRoutineData(newRoutine, routineRequestDTO);

        newRoutine.getDays().clear();
        List<RoutineDay> routineDays = mapDaysToRoutine(routineRequestDTO.getDays(), newRoutine);
        newRoutine.getDays().addAll(routineDays);

        return RoutineMapper.toDTO(routineRepository.save(newRoutine));
    }

    @Transactional
    public void deleteRoutine(Long id) {
        Routine routine = routineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + id));

        if (clientRepository.existsClientWithRoutine(id)) {
            throw new ResourceNotFoundException("The routine is assigned to one or more clients.");
        }

        routineRepository.delete(routine);
    }

    private void validateUniqueDays(List<RoutineDayRequestDTO> days) {
        if (days == null)
            return;
        Set<Integer> uniqueDays = new HashSet<>();
        for (RoutineDayRequestDTO day : days) {
            if (!uniqueDays.add(day.getDayOrder())) {
                throw new IllegalArgumentException("Duplicate day found in routine: " + day.getDayOrder());
            }
        }
    }

    private void updateRoutineData(Routine routine, RoutineRequestDTO dto) {
        routine.setActive(dto.isActive());
        routine.setName(dto.getName());
        routine.setGoal(dto.getGoal());
    }

    private List<RoutineDay> mapDaysToRoutine(List<RoutineDayRequestDTO> daysDTO, Routine routine) {
        if (daysDTO == null)
            return List.of();
        return daysDTO.stream().map(dayDTO -> {
            RoutineDay day = new RoutineDay();
            day.setDayOrder(dayDTO.getDayOrder());
            day.setRoutine(routine);

            List<RoutineExercise> routineExercises = dayDTO.getExercises().stream().map(exDTO -> {
                Exercise exercise = exerciseRepository.findById(exDTO.getIdExercise())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Exercise not found with id: " + exDTO.getIdExercise()));

                RoutineExercise re = new RoutineExercise();
                re.setExercise(exercise);
                re.setSets(exDTO.getSets());
                re.setRepetitions(exDTO.getRepetitions());
                re.setRoutineDay(day);
                return re;
            }).toList();
            day.setExercises(routineExercises);
            return day;
        }).toList();
    }

    public void assignComplexRoutine(AssignRoutineRequestDTO request) {
        transactionRunner.run(() -> {
            Client client = clientRepository.findById(request.getClientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + request.getClientId()));

            Routine routine = routineRepository.findById(request.getRoutineTemplateId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Routine not found: " + request.getRoutineTemplateId()));

            ClientRoutine clientRoutine = new ClientRoutine();
            clientRoutine.setClient(client);
            clientRoutine.setRoutine(routine);
            clientRoutine.setActive(true);
            clientRoutine.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());

            final ClientRoutine savedCR = clientRoutineRepository.save(clientRoutine);

            if (request.getSchedule() != null) {
                List<ClientSchedule> schedules = request.getSchedule().stream().map(sch -> {
                    ClientSchedule clientSchedule = new ClientSchedule();
                    clientSchedule.setClientRoutine(savedCR);
                    clientSchedule.setDayOrder(sch.getDayOrder());
                    clientSchedule.setAssignedDay(DayOfWeek.valueOf(sch.getAssignedDay().toUpperCase()));
                    return clientSchedule;
                }).toList();

                clientScheduleRepository.saveAll(schedules);
                savedCR.setSchedule(new ArrayList<>(schedules));
            }

            if (!client.getRoutines().contains(routine)) {
                client.getRoutines().add(routine);
            }
            client.setRoutineActive(routine);
            clientRepository.save(client);
        });
    }

    public void assignRoutineToClientComplex(AssignRoutineRequestDTO request) {
        assignComplexRoutine(request);
    }
}