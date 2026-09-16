package com.aplicacionGym.gymapp.config;

import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.repository.GroupClassRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Spec 0003: copia el dayOfWeek viejo de una clase (columna day_of_week, mapeada hoy como
 * legacyDayOfWeek) a daysOfWeek la primera vez que arranca el backend después del cambio de
 * modelo. Idempotente: una clase que ya tiene daysOfWeek cargados no se toca, aunque conserve el
 * campo viejo.
 */
@Component("groupClassDaysMigration")
public class GroupClassDaysMigration implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(GroupClassDaysMigration.class);

    private static final List<String> DIAS_VALIDOS = List.of(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY");

    @Autowired
    private GroupClassRepository groupClassRepository;

    @Override
    public void run(ApplicationArguments args) {
        migrar();
    }

    @Transactional
    public void migrar() {
        for (GroupClass groupClass : groupClassRepository.findAll()) {
            if (groupClass.getDaysOfWeek() != null && !groupClass.getDaysOfWeek().isEmpty()) {
                continue;
            }
            String legacy = groupClass.getLegacyDayOfWeek();
            if (legacy == null) {
                continue;
            }
            if (!DIAS_VALIDOS.contains(legacy)) {
                logger.warn("Clase {} tiene un dayOfWeek viejo inválido ('{}'); se deja sin días.",
                        groupClass.getId(), legacy);
                continue;
            }
            groupClass.setDaysOfWeek(new ArrayList<>(List.of(legacy)));
            groupClass.setLegacyDayOfWeek(null);
            groupClassRepository.save(groupClass);
        }
    }
}
