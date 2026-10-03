package com.aplicacionGym.gymapp.mapper;

import com.aplicacionGym.gymapp.dto.response.SupplementLogResponseDTO;
import com.aplicacionGym.gymapp.dto.response.WaterLogResponseDTO;
import com.aplicacionGym.gymapp.entity.SupplementLog;
import com.aplicacionGym.gymapp.entity.WaterLog;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Spec 0014: la entidad traía el Client completo (contraseña, DNI, contacto) y, con rutina activa,
 * el ciclo routineActive → clients que dejaba el JSON inválido (BUG-25). Solo viaja el clientId.
 */
@Component
public class HabitLogMapper {

    private static final int DEFAULT_TARGET_MILLILITERS = 3000;

    public static WaterLogResponseDTO toDTO(WaterLog log) {
        return new WaterLogResponseDTO(
                log.getId(),
                log.getClient() == null ? null : log.getClient().getId(),
                log.getDate(),
                log.getMilliliters(),
                log.getTargetMilliliters(),
                log.getNotes());
    }

    public static SupplementLogResponseDTO toDTO(SupplementLog log) {
        return new SupplementLogResponseDTO(
                log.getId(),
                log.getClient() == null ? null : log.getClient().getId(),
                log.getDate(),
                log.isCreatineTaken(),
                log.isProteinTaken(),
                log.getNotes());
    }

    // Registro del día que todavía no existe: el alumno no tomó agua.
    public static WaterLogResponseDTO emptyWaterLog(Long clientId, LocalDate date) {
        return new WaterLogResponseDTO(null, clientId, date, 0, DEFAULT_TARGET_MILLILITERS, "");
    }

    public static SupplementLogResponseDTO emptySupplementLog(Long clientId, LocalDate date) {
        return new SupplementLogResponseDTO(null, clientId, date, false, false, "");
    }
}
