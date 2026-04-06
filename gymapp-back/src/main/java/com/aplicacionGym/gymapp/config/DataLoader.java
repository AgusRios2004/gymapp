package com.aplicacionGym.gymapp.config;

import com.aplicacionGym.gymapp.entity.*;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
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

    @Override
    @Transactional
    public void run(String... args) {
        try {
            if (FORCE_RESEED) {
                System.out.println("🔥 CRITICAL: Resetting Database Schema (DROP TABLES)...");
                entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();
                
                String[] tables = {
                    "assistance", "payment_product", "payment", "clients_routines", 
                    "routine_exercise", "routine_day", "client", "professor", 
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

        } catch (Exception ex) {
            System.err.println("❌ Error: " + ex.getMessage());
        }
    }

    private void executeSeed() {
        System.out.println("🌱 Starting Seed Process on a clean schema...");

        // 1. Planes Mensuales
        monthlyTypeRepository.saveAll(Arrays.asList(
            new MonthlyType(null, "Plan Básico (3 veces por semana)", 15000, 30),
            new MonthlyType(null, "Plan Full (Acceso Total)", 22000, 30),
            new MonthlyType(null, "Plan Estudiante", 12000, 30)
        ));

        // 2. Ejercicios
        exerciseRepository.save(new Exercise(null, "Sentadilla Libre", "Piernas", "Músculo principal: Cuádriceps"));
        exerciseRepository.save(new Exercise(null, "Press de Banca", "Pectoral", "Músculo principal: Pectoral Mayor"));
        
        // 3. Admin y Staff
        Administrator admin = new Administrator();
        admin.setName("Admin"); admin.setLastName("Gym"); admin.setDni("11111111");
        admin.setEmail("admin@gymapp.com"); admin.setPhone("12345678");
        admin.setPassword(passwordEncoder.encode("admin123"));
        administratorRepository.save(admin);

        Professor marcos = new Professor(null, "Marcos", "Entrenador", "22222222", "11667788", 
            "marcos@gymapp.com", passwordEncoder.encode("marcos123"), true);
        marcos = professorRepository.save(marcos);
        
        professorRepository.save(new Professor(null, "Sofia", "Gimnasia", "33333333", "11443322", 
            "sofia@gymapp.com", passwordEncoder.encode("sofia123"), true));

        // 4. Clases Grupales
        GroupClass crossfit = new GroupClass();
        crossfit.setClassName("Crossfit");
        crossfit.setCapacity(20);
        crossfit.setDayOfWeek("MONDAY");
        crossfit.setStartTime("10:00");
        crossfit.setEndTime("11:00");
        crossfit.setProfessor(marcos);
        crossfit = groupClassRepository.save(crossfit);

        // 5. Alumnos
        Client c1 = new Client(null, "Carlos", "Perez", "12345678", "11667788", "carlos@gmail.com", 
            passwordEncoder.encode("alumno123"), true, crossfit, new ArrayList<>());
        clientRepository.save(c1);
        
        clientRepository.save(new Client(null, "Ana", "Gomez", "23456789", "11334455", "ana@gmail.com", 
            passwordEncoder.encode("alumno123"), true, null, new ArrayList<>()));

        // 6. Pago Inicial
        MonthlyType type = monthlyTypeRepository.findAll().get(0);
        Payment p = new Payment();
        p.setClient(c1);
        p.setProfessor(marcos);
        p.setMonthlyType(type);
        p.setAmount(type.getPrice());
        p.setDate(LocalDate.now());
        p.setPaymentType(PaymentType.MONTHLY);
        paymentRepository.save(p);

        System.out.println("✅ Seed Finished Successfully!");
    }
}
