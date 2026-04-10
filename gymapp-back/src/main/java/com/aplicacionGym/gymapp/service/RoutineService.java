package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.request.RoutineDayRequestDTO;
import com.aplicacionGym.gymapp.dto.request.RoutineRequestDTO;
import com.aplicacionGym.gymapp.dto.response.RoutineResponseDTO;
import com.aplicacionGym.gymapp.entity.Exercise;
import com.aplicacionGym.gymapp.entity.Routine;
import com.aplicacionGym.gymapp.entity.RoutineDay;
import com.aplicacionGym.gymapp.entity.RoutineExercise;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.mapper.RoutineMapper;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.ExerciseRepository;
import com.aplicacionGym.gymapp.repository.RoutineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.time.DayOfWeek;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.ClientRoutine;
import com.aplicacionGym.gymapp.entity.ClientSchedule;
import com.aplicacionGym.gymapp.dto.request.AssignRoutineRequestDTO;
import com.aplicacionGym.gymapp.repository.ClientRoutineRepository;

@Service
@Transactional
@SuppressWarnings("null")
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final ExerciseRepository exerciseRepository;
    private final ClientRepository clientRepository;
    private final ClientRoutineRepository clientRoutineRepository;

    public RoutineService(RoutineRepository routineRepository,
            ExerciseRepository exerciseRepository,
            ClientRepository clientRepository,
            ClientRoutineRepository clientRoutineRepository) {
        this.routineRepository = routineRepository;
        this.exerciseRepository = exerciseRepository;
        this.clientRepository = clientRepository;
        this.clientRoutineRepository = clientRoutineRepository;
    }

    public RoutineResponseDTO createRoutine(RoutineRequestDTO dto) {
        validateUniqueDays(dto.getDays());

        Routine routine = new Routine();
        updateRoutineData(routine, dto);

        List<RoutineDay> routineDays = mapDaysToRoutine(dto.getDays(), routine);
        routine.setDays(routineDays);

        return RoutineMapper.toDTO(routineRepository.save(routine));
    }

    public List<RoutineResponseDTO> getAllRoutines() {
        return routineRepository.findAll().stream()
                .map(RoutineMapper::toDTO)
                .toList();
    }

    public RoutineResponseDTO getRoutineById(Long id) {
        Routine routine = routineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + id));
        return RoutineMapper.toDTO(routine);
    }

    public RoutineResponseDTO updateRoutine(Long id, RoutineRequestDTO routineRequestDTO) {
        validateUniqueDays(routineRequestDTO.getDays());

        Routine routine = routineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + id));
        updateRoutineData(routine, routineRequestDTO);

        routine.getDays().clear();
        List<RoutineDay> routineDays = mapDaysToRoutine(routineRequestDTO.getDays(), routine);

        routine.getDays().addAll(routineDays);
        return RoutineMapper.toDTO(routineRepository.save(routine));
    }

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
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + request.getClientId()));

        Routine routine = routineRepository.findById(request.getRoutineTemplateId())
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found: " + request.getRoutineTemplateId()));

        // Retro-compatibilidad para que aparezca en el frontend en la vista antigua
        if (!client.getRoutines().contains(routine)) {
            client.getRoutines().add(routine);
        }
        client.setRoutineActive(routine);
        clientRepository.save(client);

        ClientRoutine clientRoutine = new ClientRoutine();
        clientRoutine.setClient(client);
        clientRoutine.setRoutine(routine);
        clientRoutine.setActive(true);
        clientRoutine.setStartDate(request.getStartDate());

        if (request.getSchedule() != null) {
            List<ClientSchedule> schedules = request.getSchedule().stream().map(sch -> {
                ClientSchedule clientSchedule = new ClientSchedule();
                clientSchedule.setClientRoutine(clientRoutine);
                clientSchedule.setDayOrder(sch.getDayOrder());
                clientSchedule.setAssignedDay(DayOfWeek.valueOf(sch.getAssignedDay().toUpperCase()));
                return clientSchedule;
            }).toList();

            clientRoutine.setSchedule(schedules);
        }

        clientRoutineRepository.save(clientRoutine);
    }

}