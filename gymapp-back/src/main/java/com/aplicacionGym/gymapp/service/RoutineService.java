package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.request.RoutineDayRequestDTO;
import com.aplicacionGym.gymapp.dto.request.RoutineExerciseRequestDTO;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoutineService {

    @Autowired
    private RoutineRepository routineRepository;
    @Autowired
    private ExerciseRepository exerciseRepository;
    @Autowired
    private RoutineMapper routineMapper;
    @Autowired
    private ClientRepository clientRepository;

    public RoutineResponseDTO createRoutine(RoutineRequestDTO dto){
        Routine routine = new Routine();
        routine.setActive(dto.isActive());
        routine.setName(dto.getName());
        routine.setGoal(dto.getGoal());

        List<RoutineDay> routineDays = dto.getDays().stream().map( routineDayRequestDTO -> {
            RoutineDay day = new RoutineDay();
            day.setDay(routineDayRequestDTO.getDay());
            day.setRoutine(routine);

            List<RoutineExercise> routineExercises = routineDayRequestDTO.getExercises().stream().map(routineExerciseRequestDTO -> {
                Exercise exercise = exerciseRepository.findById(routineExerciseRequestDTO.getIdExercise())
                        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: "+routineExerciseRequestDTO.getIdExercise()));

                RoutineExercise re = new RoutineExercise();
                re.setExercise(exercise);
                re.setSets(routineExerciseRequestDTO.getSets());
                re.setRepetitions(routineExerciseRequestDTO.getRepetitions());
                re.setRoutineDay(day);
                return re;
            }).toList();
            day.setExercises(routineExercises);
            return day;
        }).toList();
        routine.setDays(routineDays);
        return RoutineMapper.toDTO(routineRepository.save(routine));
    }

    public List<RoutineResponseDTO> getAllRoutines(){
        return routineRepository.findAll().stream()
            .map(RoutineMapper :: toDTO)
            .toList();
    }

    public RoutineResponseDTO getRoutineById(Long id) {
        Routine routine = routineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + id));
        return RoutineMapper.toDTO(routine);
    }

    public RoutineResponseDTO updateRoutine(Long id, RoutineRequestDTO routineRequestDTO){
        Routine routine = routineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: "+id));
        routine.setGoal(routineRequestDTO.getGoal());
        routine.setName(routineRequestDTO.getName());
        routine.setActive(routineRequestDTO.isActive());

        routine.getDays().clear();

        List<RoutineDay> routineDays = routineRequestDTO.getDays().stream().map(RoutineDayRequestDTO -> {
            RoutineDay routineDay = new RoutineDay();
            routineDay.setDay(RoutineDayRequestDTO.getDay());
            routineDay.setRoutine(routine);

            List<RoutineExercise> exercises = RoutineDayRequestDTO.getExercises().stream().map(RoutineExerciseRequestDTO -> {
                Exercise exercise = exerciseRepository.findById(RoutineExerciseRequestDTO.getIdExercise())
                        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: "+id));

                RoutineExercise routineExercise = new RoutineExercise();
                routineExercise.setExercise(exercise);
                routineExercise.setSets(RoutineExerciseRequestDTO.getSets());
                routineExercise.setRepetitions(RoutineExerciseRequestDTO.getRepetitions());
                routineExercise.setRoutineDay(routineDay);

                return routineExercise;
            }).toList();

            routineDay.setExercises(exercises);
            return routineDay;

        }).toList();

        routine.setDays(routineDays);
        return RoutineMapper.toDTO(routineRepository.save(routine));
    }

    public void deleteRoutine(Long id){
        Routine routine = routineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: "+id));

        if (clientRepository.existsClientWithRoutine(id)) {
            throw new ResourceNotFoundException("The routine is assigned to one or more clients.");
        }


        routineRepository.delete(routine);
    }

}