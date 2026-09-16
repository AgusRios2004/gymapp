package com.aplicacionGym.gymapp.config;

import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.repository.GroupClassRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import java.lang.reflect.Method;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests rojos de la spec 0003: migración idempotente que copia el dayOfWeek viejo de una clase a
 * daysOfWeek. GroupClassDaysMigration (T2, con su bean "groupClassDaysMigration" y su método
 * migrar()) y los campos daysOfWeek/legacyDayOfWeek de GroupClass (T1) todavía no existen. Se
 * accede a todo por reflexión a propósito: así el módulo sigue compilando hoy, y el rojo es un
 * NoSuchMethodException/NoSuchBeanDefinitionException en tiempo de ejecución -la razón esperada-
 * en vez de un error de compilación que tapa el resto del suite.
 */
@SpringBootTest
class GroupClassDaysMigrationTest {

    @Autowired
    private GroupClassRepository groupClassRepository;

    @Autowired
    private ApplicationContext applicationContext;

    private GroupClass saveLegacyClass(String legacyDayOfWeek) throws ReflectiveOperationException {
        GroupClass groupClass = new GroupClass();
        groupClass.setClassName("Funcional");
        groupClass.setStartTime("10:00");
        groupClass.setEndTime("11:00");
        groupClass.setCapacity(20);
        invoke(groupClass, "setLegacyDayOfWeek", String.class, legacyDayOfWeek);
        return groupClassRepository.save(groupClass);
    }

    private void invoke(Object target, String methodName, Class<?> paramType, Object value)
            throws ReflectiveOperationException {
        Method method = target.getClass().getMethod(methodName, paramType);
        method.invoke(target, value);
    }

    @SuppressWarnings("unchecked")
    private List<String> daysOfWeekOf(GroupClass groupClass) throws ReflectiveOperationException {
        return (List<String>) groupClass.getClass().getMethod("getDaysOfWeek").invoke(groupClass);
    }

    private String legacyDayOfWeekOf(GroupClass groupClass) throws ReflectiveOperationException {
        return (String) groupClass.getClass().getMethod("getLegacyDayOfWeek").invoke(groupClass);
    }

    private void migrar() throws ReflectiveOperationException {
        Object migration = applicationContext.getBean("groupClassDaysMigration");
        migration.getClass().getMethod("migrar").invoke(migration);
    }

    // AC-0003-07: una clase persistida con el campo viejo dayOfWeek = "THURSDAY" y sin días queda,
    // después de correr la migración, con daysOfWeek = ["THURSDAY"] y el campo viejo en null;
    // correr la migración otra vez no cambia nada.
    @Test
    void migrar_withLegacyDayOfWeekAndNoDays_copiesToDaysOfWeekAndClearsLegacyField_andIsIdempotent() throws Exception {
        GroupClass saved = saveLegacyClass("THURSDAY");

        migrar();

        GroupClass afterFirstRun = groupClassRepository.findById(saved.getId()).orElseThrow();
        assertThat(daysOfWeekOf(afterFirstRun)).containsExactly("THURSDAY");
        assertThat(legacyDayOfWeekOf(afterFirstRun)).isNull();

        migrar();

        GroupClass afterSecondRun = groupClassRepository.findById(saved.getId()).orElseThrow();
        assertThat(daysOfWeekOf(afterSecondRun)).containsExactly("THURSDAY");
        assertThat(legacyDayOfWeekOf(afterSecondRun)).isNull();
    }

    // AC-0003-08: la migración no toca una clase que ya tiene daysOfWeek cargados, aunque también
    // tenga el campo viejo con un valor distinto.
    @Test
    void migrar_withClassAlreadyHavingDaysOfWeek_leavesItUntouched() throws Exception {
        GroupClass groupClass = saveLegacyClass("THURSDAY");
        invoke(groupClass, "setDaysOfWeek", List.class, List.of("MONDAY", "WEDNESDAY"));
        GroupClass saved = groupClassRepository.save(groupClass);

        migrar();

        GroupClass afterRun = groupClassRepository.findById(saved.getId()).orElseThrow();
        assertThat(daysOfWeekOf(afterRun)).containsExactly("MONDAY", "WEDNESDAY");
        assertThat(legacyDayOfWeekOf(afterRun)).isEqualTo("THURSDAY");
    }
}
