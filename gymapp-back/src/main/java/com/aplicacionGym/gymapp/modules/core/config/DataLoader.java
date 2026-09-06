package com.aplicacionGym.gymapp.modules.core.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.aplicacionGym.gymapp.modules.attendance.entity.GroupClass;
import com.aplicacionGym.gymapp.modules.attendance.repository.AssistanceRepository;
import com.aplicacionGym.gymapp.modules.attendance.repository.GroupClassRepository;
import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.clients.entity.PhysicalRecord;
import com.aplicacionGym.gymapp.modules.clients.repository.ClientRepository;
import com.aplicacionGym.gymapp.modules.clients.repository.PhysicalRecordRepository;
import com.aplicacionGym.gymapp.modules.core.entity.Administrator;
import com.aplicacionGym.gymapp.modules.core.entity.Professor;
import com.aplicacionGym.gymapp.modules.core.repository.AdministratorRepository;
import com.aplicacionGym.gymapp.modules.core.repository.ProfessorRepository;
import com.aplicacionGym.gymapp.modules.payments.entity.MonthlyType;
import com.aplicacionGym.gymapp.modules.payments.entity.Payment;
import com.aplicacionGym.gymapp.modules.payments.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.modules.payments.repository.MonthlyTypeRepository;
import com.aplicacionGym.gymapp.modules.payments.repository.PaymentProductRepository;
import com.aplicacionGym.gymapp.modules.payments.repository.PaymentRepository;
import com.aplicacionGym.gymapp.modules.payments.repository.ProductRepository;
import com.aplicacionGym.gymapp.modules.routines.entity.Exercise;
import com.aplicacionGym.gymapp.modules.routines.entity.Routine;
import com.aplicacionGym.gymapp.modules.routines.repository.ExerciseRepository;
import com.aplicacionGym.gymapp.modules.routines.repository.RoutineRepository;



import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@SuppressWarnings("null")
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    // PASO 1: Pon esto en 'true' para BORRAR las tablas corruptas. (COMPLETADO)
    // PASO 2: Ponlo en 'false' para que Hibernate cree las tablas y se carguen los datos.
    private static final boolean FORCE_RESEED = false; 

    @PersistenceContext
    private EntityManager entityManager;

    private final MonthlyTypeRepository monthlyTypeRepository;
    private final ExerciseRepository exerciseRepository;
    private final ProductRepository productRepository;
    private final ClientRepository clientRepository;
    private final ProfessorRepository professorRepository;
    private final AdministratorRepository administratorRepository;
    private final PaymentRepository paymentRepository;
    private final GroupClassRepository groupClassRepository;
    private final PasswordEncoder passwordEncoder;
    private final AssistanceRepository assistanceRepository;
    private final PaymentProductRepository paymentProductRepository;
    private final RoutineRepository routineRepository;
    private final PhysicalRecordRepository physicalRecordRepository;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            if (FORCE_RESEED) {
                log.info("🔥 CRITICAL: Resetting Database Schema (DROP TABLES)...");
                entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();
                
                String[] tables = {
                    "assistance", "payment_product", "payment", "clients_routines", 
                    "routine_exercise", "routine_day", "physical_record", "client", "professor", 
                    "administrator", "person", "group_class", "product", "exercise", 
                    "routine", "monthly_type"
                };

                for (String table : tables) {
                    try {
                        entityManager.createNativeQuery("DROP TABLE IF EXISTS " + table).executeUpdate();
                        log.info("🗑️ Dropped table: " + table);
                    } catch (Exception e) {
                        log.error("❌ Could not drop table " + table + ": " + e.getMessage());
                    }
                }
                
                entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
                log.info("♻️ SCHEMA RESET COMPLETE. Now set FORCE_RESEED = false and redeploy to rebuild database.");
                
                // Forzamos el cierre para que Render sepa que terminamos la limpieza
                System.exit(0);
                return;
            }

            // --- ESTO SOLO CORRE CUANDO FORCE_RESEED ES FALSE ---
            // DISABLED: Flyway now handles migrations and initial seed
            /*
            if (monthlyTypeRepository.count() == 0) {
                executeSeed();
            }
            */

            // Mock de métricas físicas si no existen
            if (physicalRecordRepository.count() == 0) {
                seedPhysicalRecords();
            }

        } catch (Exception ex) {
            log.error("❌ Error: " + ex.getMessage());
        }
    }

    private void seedPhysicalRecords() {
        System.out.println("📈 Seeding professional mock physical records...");
        List<Client> clients = clientRepository.findAll();
        LocalDate today = LocalDate.now();

        for (int i = 0; i < clients.size(); i++) {
            Client client = clients.get(i);
            
            if (i == 0) { // Carlos: Evolución constante (Baja peso, sube músculo)
                physicalRecordRepository.save(new PhysicalRecord(null, client, today.minusMonths(3), 90.0, 30.0, 28.0, "Punto de partida"));
                physicalRecordRepository.save(new PhysicalRecord(null, client, today.minusMonths(2), 87.5, 31.5, 25.0, "Bajando harinas"));
                physicalRecordRepository.save(new PhysicalRecord(null, client, today.minusMonths(1), 85.0, 33.0, 22.0, "Más fuerza en sentadillas"));
                physicalRecordRepository.save(new PhysicalRecord(null, client, today, 82.5, 35.0, 19.0, "Gran progreso trimestral"));
            } else if (i == 1) { // Ana: Mantenimiento y tonificación
                physicalRecordRepository.save(new PhysicalRecord(null, client, today.minusMonths(2), 60.0, 25.0, 22.0, "Iniciando Yoga"));
                physicalRecordRepository.save(new PhysicalRecord(null, client, today.minusMonths(1), 59.5, 26.0, 20.5, "Mejor flexibilidad"));
                physicalRecordRepository.save(new PhysicalRecord(null, client, today, 59.0, 27.5, 18.0, "Cuerpo más definido"));
            } else { // Roberto: Subida de peso inicial
                physicalRecordRepository.save(new PhysicalRecord(null, client, today.minusMonths(1), 75.0, 28.0, 24.0, "Primer registro"));
                physicalRecordRepository.save(new PhysicalRecord(null, client, today, 77.0, 29.5, 25.0, "Aumento de volumen (bulking)"));
            }
        }
        System.out.println("✅ Professional mock metrics seeded!");
    }

    private void executeSeed() {
        log.info("🌱 Starting Seed Process on a clean schema...");

        // 1. Planes Mensuales
        MonthlyType basic = monthlyTypeRepository.save(new MonthlyType(null, "Plan Básico (3 veces por semana)", 15000, 30));
        MonthlyType full = monthlyTypeRepository.save(new MonthlyType(null, "Plan Full (Acceso Total)", 22000, 30));
        MonthlyType student = monthlyTypeRepository.save(new MonthlyType(null, "Plan Estudiante", 12000, 30));

        // 2. Ejercicios (Variedad para rutinas)
        exerciseRepository.save(new Exercise(null, "Sentadilla Libre", "Piernas", "Músculo principal: Cuádriceps"));
        exerciseRepository.save(new Exercise(null, "Press de Banca", "Pectoral", "Músculo principal: Pectoral Mayor"));
        exerciseRepository.save(new Exercise(null, "Peso Muerto", "Espalda/Piernas", "Músculo principal: Cadena Posterior"));
        exerciseRepository.save(new Exercise(null, "Press Militar", "Hombros", "Músculo principal: Deltoides"));
        exerciseRepository.save(new Exercise(null, "Dominadas", "Espalda", "Músculo principal: Dorsal Ancho"));
        
        // 3. Admin y Staff
        Administrator admin = new Administrator();
        admin.setName("Agustin"); admin.setLastName("Admin"); admin.setDni("11111111");
        admin.setEmail("admin@gymapp.com"); admin.setPhone("12345678");
        admin.setPassword(passwordEncoder.encode("admin123"));
        administratorRepository.save(admin);

        Professor marcos = new Professor(null, "Marcos", "Entrenador", "22222222", "11667788", 
            "marcos@gymapp.com", passwordEncoder.encode("marcos123"), true);
        marcos = professorRepository.save(marcos);
        
        Professor sofia = professorRepository.save(new Professor(null, "Sofia", "Gimnasia", "33333333", "11443322", 
            "sofia@gymapp.com", passwordEncoder.encode("sofia123"), true));

        // 4. Clases Grupales
        GroupClass crossfit = new GroupClass();
        crossfit.setClassName("Crossfit"); crossfit.setCapacity(20); crossfit.setDayOfWeek("MONDAY");
        crossfit.setStartTime("10:00"); crossfit.setEndTime("11:00"); crossfit.setProfessor(marcos);
        crossfit = groupClassRepository.save(crossfit);

        GroupClass yoga = new GroupClass();
        yoga.setClassName("Yoga"); yoga.setCapacity(15); yoga.setDayOfWeek("WEDNESDAY");
        yoga.setStartTime("18:00"); yoga.setEndTime("19:00"); yoga.setProfessor(sofia);
        yoga = groupClassRepository.save(yoga);

        // 5. Alumnos (Diversos perfiles)
        Client c1 = new Client(null, "Carlos", "Perez", "12345678", "11667788", "carlos@gmail.com", 
            passwordEncoder.encode("alumno123"), true, crossfit, new ArrayList<>());
        clientRepository.save(c1);
        
        Client c2 = new Client(null, "Ana", "Gomez", "23456789", "11334455", "ana@gmail.com", 
            passwordEncoder.encode("alumno123"), true, yoga, new ArrayList<>());
        clientRepository.save(c2);

        Client c3 = new Client(null, "Roberto", "Sanchez", "34567890", "11223344", "roberto@gmail.com", 
            passwordEncoder.encode("alumno123"), false, null, new ArrayList<>());
        clientRepository.save(c3);

        // 6. Pagos para que se vean en el historial
        LocalDate today = LocalDate.now();
        paymentRepository.save(new Payment(null, false, today.minusDays(5), full.getPrice(), PaymentType.MONTHLY, c1, marcos, full, new ArrayList<>()));
        paymentRepository.save(new Payment(null, false, today.minusDays(10), student.getPrice(), PaymentType.MONTHLY, c2, sofia, student, new ArrayList<>()));
        
        // 7. Rutina Global
        Routine fatLoss = new Routine();
        fatLoss.setName("Quema de Grasa Extrema");
        fatLoss.setGoal("Bajar porcentaje de grasa manteniendo músculo");
        fatLoss.setActive(true);
        routineRepository.save(fatLoss);

        log.info("✅ Seed Finished Successfully!");
    }
}
