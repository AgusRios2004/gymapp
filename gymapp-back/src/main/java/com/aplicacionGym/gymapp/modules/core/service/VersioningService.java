package com.aplicacionGym.gymapp.modules.core.service;

import com.aplicacionGym.gymapp.modules.routines.entity.Routine;
import com.aplicacionGym.gymapp.modules.routines.entity.RoutineDay;
import com.aplicacionGym.gymapp.modules.routines.entity.RoutineExercise;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class VersioningService {

    public Routine cloneForNewVersion(Routine original) {
        Routine clone = new Routine();
        clone.setName(original.getName());
        clone.setGoal(original.getGoal());
        clone.setActive(true);
        clone.setVersion(original.getVersion() + 1);
        clone.setParentId(original.getId());

        if (original.getDays() != null) {
            clone.setDays(original.getDays().stream()
                    .map(day -> cloneDay(day, clone))
                    .collect(Collectors.toCollection(ArrayList::new)));
        }

        return clone;
    }

    private RoutineDay cloneDay(RoutineDay originalDay, Routine routine) {
        RoutineDay cloneDay = new RoutineDay();
        cloneDay.setDayOrder(originalDay.getDayOrder());
        cloneDay.setRoutine(routine);

        if (originalDay.getExercises() != null) {
            cloneDay.setExercises(originalDay.getExercises().stream()
                    .map(ex -> cloneExercise(ex, cloneDay))
                    .collect(Collectors.toCollection(ArrayList::new)));
        }

        return cloneDay;
    }

    private RoutineExercise cloneExercise(RoutineExercise originalEx, RoutineDay day) {
        RoutineExercise cloneEx = new RoutineExercise();
        cloneEx.setExercise(originalEx.getExercise());
        cloneEx.setSets(originalEx.getSets());
        cloneEx.setRepetitions(originalEx.getRepetitions());
        cloneEx.setRoutineDay(day);
        return cloneEx;
    }
}
