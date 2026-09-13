package com.aplicacionGym.gymapp.config;

import com.aplicacionGym.gymapp.entity.*;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
// Los tests lo apagan con app.seed.enabled=false (src/test/resources/application.properties).
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
@SuppressWarnings("null")
public class DataLoader implements CommandLineRunner {

    // PASO 1: Pon esto en 'true' para BORRAR las tablas corruptas. (COMPLETADO)
    // PASO 2: Ponlo en 'false' para que Hibernate cree las tablas y se carguen los datos.
    private static final boolean FORCE_RESEED = false; 

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired private MonthlyTypeRepository monthlyTypeRepository;
    @Autowired private ExerciseRepository exerciseRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private ProfessorRepository professorRepository;
    @Autowired private AdministratorRepository administratorRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private GroupClassRepository groupClassRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AssistanceRepository assistanceRepository;
    @Autowired private PaymentProductRepository paymentProductRepository;
    @Autowired private RoutineRepository routineRepository;
    @Autowired private PhysicalRecordRepository physicalRecordRepository;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            if (FORCE_RESEED) {
                System.out.println("🔥 CRITICAL: Resetting Database Schema (DROP TABLES)...");
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
                        System.out.println("🗑️ Dropped table: " + table);
                    } catch (Exception e) {
                        System.err.println("❌ Could not drop table " + table + ": " + e.getMessage());
                    }
                }
                
                entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
                System.out.println("♻️ SCHEMA RESET COMPLETE. Now set FORCE_RESEED = false and redeploy to rebuild database.");
                
                // Forzamos el cierre para que Render sepa que terminamos la limpieza
                System.exit(0);
                return;
            }

            // --- ESTO SOLO CORRE CUANDO FORCE_RESEED ES FALSE ---
            if (monthlyTypeRepository.count() == 0) {
                executeSeed();
            }

            // Mock de métricas físicas si no existen
            if (physicalRecordRepository.count() == 0) {
                seedPhysicalRecords();
            }

        } catch (Exception ex) {
            System.err.println("❌ Error: " + ex.getMessage());
        }
    }

    private void seedPhysicalRecords() {
        System.out.println("📈 Seeding professional mock physical records...");
        List<Client> clients = clientRepository.findAll();
        LocalDate today = LocalDate.now();

        for (int i = 0; i < clients.size(); i++) {
            Client client = clients.get(i);
            
            if (i == 0) { // Carlos: Evolución constante (Baja peso, sube músculo)
                client.setHeight(1.78);
                client.setTargetFatPercentage(15.0);
                client.setTargetMuscleMass(38.0);
                clientRepository.save(client);

                physicalRecordRepository.save(new PhysicalRecord(null, client, today.minusMonths(3), 90.0, 1.78, 30.0, 28.0, "Punto de partida"));
                physicalRecordRepository.save(new PhysicalRecord(null, client, today.minusMonths(2), 87.5, 1.78, 31.5, 25.0, "Bajando harinas"));
                physicalRecordRepository.save(new PhysicalRecord(null, client, today.minusMonths(1), 85.0, 1.78, 33.0, 22.0, "Más fuerza en sentadillas"));
                physicalRecordRepository.save(new PhysicalRecord(null, client, today, 82.5, 1.78, 35.0, 19.0, "Gran progreso trimestral"));
            } else if (i == 1) { // Ana: Mantenimiento y tonificación
                client.setHeight(1.65);
                client.setTargetFatPercentage(18.0);
                client.setTargetMuscleMass(28.0);
                clientRepository.save(client);

                physicalRecordRepository.save(new PhysicalRecord(null, client, today.minusMonths(2), 60.0, 1.65, 25.0, 22.0, "Iniciando Yoga"));
                physicalRecordRepository.save(new PhysicalRecord(null, client, today.minusMonths(1), 59.5, 1.65, 26.0, 20.5, "Mejor flexibilidad"));
                physicalRecordRepository.save(new PhysicalRecord(null, client, today, 59.0, 1.65, 27.5, 18.0, "Cuerpo más definido"));
            } else { // Roberto: Subida de peso inicial
                client.setHeight(1.75);
                client.setTargetFatPercentage(20.0);
                client.setTargetMuscleMass(32.0);
                clientRepository.save(client);

                physicalRecordRepository.save(new PhysicalRecord(null, client, today.minusMonths(1), 75.0, 1.75, 28.0, 24.0, "Primer registro"));
                physicalRecordRepository.save(new PhysicalRecord(null, client, today, 77.0, 1.75, 29.5, 25.0, "Aumento de volumen (bulking)"));
            }
        }
        System.out.println("✅ Professional mock metrics seeded!");
    }

    private void executeSeed() {
        System.out.println("🌱 Starting Seed Process on a clean schema...");

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
        paymentRepository.save(new Payment(null, c1, marcos, full, full.getPrice(), today.minusDays(5), PaymentType.MONTHLY));
        paymentRepository.save(new Payment(null, c2, sofia, student, student.getPrice(), today.minusDays(10), PaymentType.MONTHLY));
        
        // 7. Rutina Global
        Routine fatLoss = new Routine();
        fatLoss.setName("Quema de Grasa Extrema");
        fatLoss.setGoal("Bajar porcentaje de grasa manteniendo músculo");
        fatLoss.setActive(true);
        routineRepository.save(fatLoss);

        System.out.println("✅ Seed Finished Successfully!");
    }
}
