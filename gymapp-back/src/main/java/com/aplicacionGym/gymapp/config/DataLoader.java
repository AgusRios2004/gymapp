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

    // CAMBIA ESTO A 'true' para borrar la base de datos de TiDB y re-ejecutar el seed
    // LUEGO VUELVE A PONERLO EN 'false'
    private static final boolean FORCE_RESEED = true; 

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
    public void run(String... args) throws Exception {
        
        if (FORCE_RESEED) {
            System.out.println("⚠️ FORCING RESEED: Cleaning database with Native SQL...");
            // Desactivamos checks de FK para poder borrar en cualquier orden
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();
            
            entityManager.createNativeQuery("DELETE FROM assistance").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM payment_product").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM payment").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM clients_routines").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM routine_exercise").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM routine_day").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM client").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM group_class").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM professor").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM administrator").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM person").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM product").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM exercise").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM routine").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM monthly_type").executeUpdate();
            
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
            System.out.println("✅ Database cleaned successfully");
        }

        // 1. Planes Mensuales
        if (monthlyTypeRepository.count() == 0) {
            monthlyTypeRepository.saveAll(Arrays.asList(
                new MonthlyType(null, "Plan Básico (3 veces por semana)", 15000, 30),
                new MonthlyType(null, "Plan Full (Acceso Total)", 22000, 30),
                new MonthlyType(null, "Plan Estudiante", 12000, 30)
            ));
            System.out.println("✅ Planes Mensuales creados");
        }

        // 2. Ejercicios
        if (exerciseRepository.count() == 0) {
            exerciseRepository.saveAll(Arrays.asList(
                new Exercise(null, "Sentadilla Libre", "Piernas", "Músculo principal: Cuádriceps"),
                new Exercise(null, "Press de Banca", "Pectorales", "Músculo principal: Pectoral Mayor"),
                new Exercise(null, "Peso Muerto", "Espalda/Piernas", "Ejercicio completo")
            ));
            System.out.println("✅ Ejercicios creados");
        }

        // 3. Admin y Profesores
        if (administratorRepository.count() == 0) {
            Administrator admin = new Administrator();
            admin.setName("Admin"); admin.setLastName("Gym"); admin.setDni("11111111");
            admin.setEmail("admin@gymapp.com"); admin.setPhone("12345678");
            admin.setPassword(passwordEncoder.encode("admin123"));
            administratorRepository.save(admin);
        }

        Professor marcos = null;
        if (professorRepository.count() == 0) {
            marcos = new Professor(null, "Marcos", "Entrenador", "22222222", "15443322", 
                "marcos@gymapp.com", passwordEncoder.encode("marcos123"), true);
            marcos = professorRepository.save(marcos);
            
            professorRepository.save(new Professor(null, "Sofia", "Gimnasia", "33333333", "55667788", 
                "sofia@gymapp.com", passwordEncoder.encode("sofia123"), true));
            System.out.println("✅ Staff creado");
        } else {
            marcos = professorRepository.findAll().get(0);
        }

        // 4. Clases Grupales
        GroupClass crossfit = null;
        if (groupClassRepository.count() == 0) {
            crossfit = new GroupClass();
            crossfit.setClassName("Crossfit");
            crossfit.setCapacity(20);
            crossfit.setDayOfWeek("MONDAY");
            crossfit.setStartTime("10:00");
            crossfit.setEndTime("11:00");
            crossfit.setProfessor(marcos);
            crossfit = groupClassRepository.save(crossfit);
            
            GroupClass yoga = new GroupClass();
            yoga.setClassName("Yoga");
            yoga.setCapacity(15);
            yoga.setDayOfWeek("WEDNESDAY");
            yoga.setStartTime("18:00");
            yoga.setEndTime("19:00");
            yoga.setProfessor(marcos);
            groupClassRepository.save(yoga);
            System.out.println("✅ Clases grupales creadas");
        } else {
            crossfit = groupClassRepository.findAll().get(0);
        }

        // 5. Productos
        if (productRepository.count() == 0) {
            Product p1 = new Product(); p1.setProductName("Agua 500ml"); p1.setPrice(1200); p1.setStock(100);
            productRepository.save(p1);
            System.out.println("✅ Productos creados");
        }

        // 6. Alumnos
        if (clientRepository.count() == 0) {
            Client c1 = new Client(null, "Carlos", "Perez", "12345678", "11667788", "carlos@gmail.com", 
                passwordEncoder.encode("alumno123"), true, crossfit, new ArrayList<>());
            clientRepository.save(c1);
            
            clientRepository.save(new Client(null, "Ana", "Gomez", "23456789", "11334455", "ana@gmail.com", 
                passwordEncoder.encode("alumno123"), true, null, new ArrayList<>()));
            System.out.println("✅ Alumnos creados");
        }

        // 7. Pago Inicial
        if (paymentRepository.count() == 0) {
            Client client = clientRepository.findAll().get(0);
            MonthlyType type = monthlyTypeRepository.findAll().get(0);

            Payment p = new Payment();
            p.setClient(client);
            p.setProfessor(marcos);
            p.setMonthlyType(type);
            p.setAmount(type.getPrice());
            p.setDate(LocalDate.now());
            p.setPaymentType(PaymentType.MONTHLY);
            paymentRepository.save(p);
            System.out.println("✅ Pago inicial registrado");
        }
    }
}
