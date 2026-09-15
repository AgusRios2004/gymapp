package com.aplicacionGym.gymapp.config;

import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.repository.GroupClassRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests rojos de la spec 0003: migración idempotente que copia el dayOfWeek viejo de una clase a
 * daysOfWeek. GroupClassDaysMigration y GroupClass#legacyDayOfWeek/#daysOfWeek todavía no existen
 * (T2 depende de T1) — esta clase no compila hasta implementarlos, que es la razón esperada por la
 * que el test queda en rojo.
 */
@SpringBootTest
class GroupClassDaysMigrationTest {

    @Autowired
    private GroupClassRepository groupClassRepository;

    @Autowired
    private GroupClassDaysMigration groupClassDaysMigration;

    private GroupClass saveLegacyClass(String legacyDayOfWeek) {
        GroupClass groupClass = new GroupClass();
        groupClass.setClassName("Funcional");
        groupClass.setStartTime("10:00");
        groupClass.setEndTime("11:00");
        groupClass.setCapacity(20);
        groupClass.setLegacyDayOfWeek(legacyDayOfWeek);
        return groupClassRepository.save(groupClass);
    }

    // AC-0003-07: una clase persistida con el campo viejo dayOfWeek = "THURSDAY" y sin días queda,
    // después de correr la migración, con daysOfWeek = ["THURSDAY"] y el campo viejo en null;
    // correr la migración otra vez no cambia nada.
    @Test
    void migrar_withLegacyDayOfWeekAndNoDays_copiesToDaysOfWeekAndClearsLegacyField_andIsIdempotent() {
        GroupClass saved = saveLegacyClass("THURSDAY");

        groupClassDaysMigration.migrar();

        GroupClass afterFirstRun = groupClassRepository.findById(saved.getId()).orElseThrow();
        assertThat(afterFirstRun.getDaysOfWeek()).containsExactly("THURSDAY");
        assertThat(afterFirstRun.getLegacyDayOfWeek()).isNull();

        groupClassDaysMigration.migrar();

        GroupClass afterSecondRun = groupClassRepository.findById(saved.getId()).orElseThrow();
        assertThat(afterSecondRun.getDaysOfWeek()).containsExactly("THURSDAY");
        assertThat(afterSecondRun.getLegacyDayOfWeek()).isNull();
    }

    // AC-0003-08: la migración no toca una clase que ya tiene daysOfWeek cargados, aunque también
    // tenga el campo viejo con un valor distinto.
    @Test
    void migrar_withClassAlreadyHavingDaysOfWeek_leavesItUntouched() {
        GroupClass groupClass = saveLegacyClass("THURSDAY");
        groupClass.setDaysOfWeek(List.of("MONDAY", "WEDNESDAY"));
        GroupClass saved = groupClassRepository.save(groupClass);

        groupClassDaysMigration.migrar();

        GroupClass afterRun = groupClassRepository.findById(saved.getId()).orElseThrow();
        assertThat(afterRun.getDaysOfWeek()).containsExactly("MONDAY", "WEDNESDAY");
        assertThat(afterRun.getLegacyDayOfWeek()).isEqualTo("THURSDAY");
    }
}
