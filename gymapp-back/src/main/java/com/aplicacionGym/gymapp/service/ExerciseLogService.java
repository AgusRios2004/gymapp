package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.ExerciseLog;
import com.aplicacionGym.gymapp.repository.ExerciseLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ExerciseLogService {

    @Autowired
    private ExerciseLogRepository exerciseLogRepository;

    public ExerciseLog saveLog(ExerciseLog log) {
        if (log.getDate() == null) {
            log.setDate(LocalDate.now());
        }
        return exerciseLogRepository.save(log);
    }

    public List<ExerciseLog> getLogsByClient(Long clientId) {
        return exerciseLogRepository.findByClientId(clientId);
    }

    public Optional<ExerciseLog> getLatestLogForExercise(Long clientId, Long exerciseId) {
        return exerciseLogRepository.findByClientIdAndExerciseIdOrderByDateDesc(clientId, exerciseId)
                .stream()
                .findFirst();
    }

    public List<ExerciseLog> getHistoryForExercise(Long clientId, Long exerciseId) {
        return exerciseLogRepository.findByClientIdAndExerciseIdOrderByDateDesc(clientId, exerciseId);
    }

    public void deleteLog(Long id) {
        exerciseLogRepository.deleteById(id);
    }
}
