package com.aplicacionGym.gymapp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.aplicacionGym.gymapp.controller.NutritionController;
import com.aplicacionGym.gymapp.controller.SupplementController;
import com.aplicacionGym.gymapp.controller.WaterLogController;
import com.aplicacionGym.gymapp.dto.request.AssignRoutineRequestDTO;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.ClientRoutine;
import com.aplicacionGym.gymapp.entity.ExerciseLog;
import com.aplicacionGym.gymapp.entity.MealLog;
import com.aplicacionGym.gymapp.entity.Routine;
import com.aplicacionGym.gymapp.entity.SupplementLog;
import com.aplicacionGym.gymapp.entity.WaterLog;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.ClientRoutineRepository;
import com.aplicacionGym.gymapp.repository.ExerciseLogRepository;
import com.aplicacionGym.gymapp.repository.ExerciseRepository;
import com.aplicacionGym.gymapp.repository.MealLogRepository;
import com.aplicacionGym.gymapp.repository.NutritionPlanRepository;
import com.aplicacionGym.gymapp.repository.RoutineRepository;
import com.aplicacionGym.gymapp.repository.SupplementLogRepository;
import com.aplicacionGym.gymapp.repository.WaterLogRepository;

/**
 * Spec 0010: cuando no llega una fecha, los registros del día (agua, suplementos, comidas,
 * ejercicios, inicio de rutina) toman el día de Argentina. En UTC, a las 21:40 del 24/09 quedaban
 * con fecha 25.
 */
@ExtendWith(MockitoExtension.class)
class DefaultDatesClockTest {

    private static final LocalDate HOY_AR = LocalDate.of(2026, 9, 24);

    // 24/09/2026 21:40 en Argentina.
    @Spy
    private Clock clock = Clock.fixed(Instant.parse("2026-09-25T00:40:00Z"), ZoneId.of("America/Argentina/Buenos_Aires"));

    @Mock
    private ClientRepository clientRepository;
    @Mock
    private WaterLogRepository waterLogRepository;
    @Mock
    private SupplementLogRepository supplementLogRepository;
    @Mock
    private MealLogRepository mealLogRepository;
    @Mock
    private NutritionPlanRepository nutritionPlanRepository;
    @Mock
    private ExerciseLogRepository exerciseLogRepository;
    @Mock
    private RoutineRepository routineRepository;
    @Mock
    private ExerciseRepository exerciseRepository;
    @Mock
    private ClientRoutineRepository clientRoutineRepository;

    @InjectMocks
    private WaterLogService waterLogService;
    @InjectMocks
    private SupplementService supplementService;
    @InjectMocks
    private NutritionService nutritionService;
    @InjectMocks
    private ExerciseLogService exerciseLogService;
    @InjectMocks
    private RoutineService routineService;

    @Mock
    private WaterLogService waterLogServiceMock;
    @Mock
    private SupplementService supplementServiceMock;
    @Mock
    private NutritionService nutritionServiceMock;

    private final Client client = new Client();

    @BeforeEach
    void setUp() {
        client.setId(1L);
        client.setRoutines(new ArrayList<>());
    }

    @Test
    @DisplayName("AC-0010-07: agua y suplementos sin fecha usan el día de Argentina")
    void ac_0010_07_aguaYSuplementosSinFechaUsanElDiaDeArgentina() throws Exception {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(waterLogRepository.findByClientIdAndDate(anyLong(), any())).thenReturn(Optional.empty());
        when(waterLogRepository.save(any(WaterLog.class))).thenAnswer(inv -> inv.getArgument(0));
        when(supplementLogRepository.findByClientIdAndDate(anyLong(), any())).thenReturn(Optional.empty());
        when(supplementLogRepository.save(any(SupplementLog.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThat(waterLogService.addWater(1L, null, 250).getDate()).isEqualTo(HOY_AR);
        assertThat(supplementService.updateOrCreateLog(1L, new SupplementLog()).getDate()).isEqualTo(HOY_AR);

        WaterLogController waterController = new WaterLogController();
        org.springframework.test.util.ReflectionTestUtils.setField(waterController, "waterLogService", waterLogServiceMock);
        org.springframework.test.util.ReflectionTestUtils.setField(waterController, "clock", clock);
        SupplementController supplementController = new SupplementController();
        org.springframework.test.util.ReflectionTestUtils.setField(supplementController, "supplementService", supplementServiceMock);
        org.springframework.test.util.ReflectionTestUtils.setField(supplementController, "clock", clock);
        MockMvc mvc = MockMvcBuilders.standaloneSetup(waterController, supplementController).build();

        mvc.perform(get("/api/clients/1/water"));
        mvc.perform(get("/api/clients/1/supplements"));

        verify(waterLogServiceMock).getLogByDate(1L, HOY_AR);
        verify(supplementServiceMock).getLogByDate(1L, HOY_AR);
    }

    @Test
    @DisplayName("AC-0010-08: comidas y ejercicios sin fecha usan el día de Argentina")
    void ac_0010_08_comidasYEjerciciosSinFechaUsanElDiaDeArgentina() throws Exception {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(mealLogRepository.save(any(MealLog.class))).thenAnswer(inv -> inv.getArgument(0));
        when(exerciseLogRepository.save(any(ExerciseLog.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThat(nutritionService.logMeal(1L, new MealLog()).getDate()).isEqualTo(HOY_AR);
        assertThat(exerciseLogService.saveLog(new ExerciseLog()).getDate()).isEqualTo(HOY_AR);

        NutritionController nutritionController = new NutritionController();
        org.springframework.test.util.ReflectionTestUtils.setField(nutritionController, "nutritionService", nutritionServiceMock);
        org.springframework.test.util.ReflectionTestUtils.setField(nutritionController, "clock", clock);
        MockMvcBuilders.standaloneSetup(nutritionController).build().perform(get("/api/clients/1/nutrition/meals"));

        verify(nutritionServiceMock).getMealsByClientAndDate(1L, HOY_AR);
    }

    @Test
    @DisplayName("AC-0010-09: la rutina asignada sin fecha de inicio empieza el día de Argentina")
    void ac_0010_09_laRutinaAsignadaSinFechaDeInicioEmpiezaElDiaDeArgentina() {
        Routine routine = new Routine();
        routine.setId(5L);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(routineRepository.findById(5L)).thenReturn(Optional.of(routine));
        AssignRoutineRequestDTO request = new AssignRoutineRequestDTO();
        request.setClientId(1L);
        request.setRoutineTemplateId(5L);

        routineService.assignComplexRoutine(request);

        ArgumentCaptor<ClientRoutine> saved = ArgumentCaptor.forClass(ClientRoutine.class);
        verify(clientRoutineRepository).save(saved.capture());
        assertThat(saved.getValue().getStartDate()).isEqualTo(HOY_AR);
    }
}
