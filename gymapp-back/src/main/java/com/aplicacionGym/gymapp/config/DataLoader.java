package com.aplicacionGym.gymapp.config;

import com.aplicacionGym.gymapp.entity.*;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private MonthlyTypeRepository monthlyTypeRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed MonthlyTypes if empty
        if (monthlyTypeRepository.count() == 0) {
            monthlyTypeRepository.saveAll(Arrays.asList(
                    new MonthlyType(null, "Plan Básico (3 veces por semana)", 15000, 30),
                    new MonthlyType(null, "Plan Full (Acceso Total)", 22000, 30),
                    new MonthlyType(null, "Plan Estudiante", 12000, 30)));
            System.out.println("✅ MonthlyTypes seeded");
        }

        // 2. Seed Exercises if empty
        if (exerciseRepository.count() == 0) {
            exerciseRepository.saveAll(Arrays.asList(
                    new Exercise(null, "Sentadilla Libre", "Cuádriceps", "Músculo principal: Cuádriceps"),
                    new Exercise(null, "Press de Banca", "Pectorales", "Músculo principal: Pectoral Mayor"),
                    new Exercise(null, "Peso Muerto", "Lower Back", "Ejercicio multiarticular"),
                    new Exercise(null, "Remo con Mancuerna", "Back", "Dorsales"),
                    new Exercise(null, "Curl de Bíceps", "Arms", "Flexión de codo"),
                    new Exercise(null, "Press Militar", "Shoulders", "Deltoides anterior")));
            System.out.println("✅ Exercises seeded");
        }

        // 3. Seed Administrator if empty
        if (administratorRepository.count() == 0) {
            Administrator admin = new Administrator();
            admin.setName("Admin");
            admin.setLastName("Gym");
            admin.setDni("11111111");
            admin.setEmail("admin@gymapp.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setPhone("12345678");
            administratorRepository.save(admin);
            System.out.println("✅ Administrator seeded");
        }

        // 4. Seed Professors if empty
        if (professorRepository.count() == 0) {
            professorRepository.saveAll(Arrays.asList(
                    new Professor(null, "Marcos", "Entrenador", "22222222", "11223344", "marcos@gymapp.com",
                            passwordEncoder.encode("marcos123"), true),
                    new Professor(null, "Sofia", "Gimnasia", "33333333", "55667788", "sofia@gymapp.com",
                            passwordEncoder.encode("sofia123"), true)));
            System.out.println("✅ Professors seeded");
        }

        // 5. Seed Products if empty
        if (productRepository.count() == 0) {
            ArrayList<Product> products = new ArrayList<>();

            Product p1 = new Product();
            p1.setProductName("Agua 500ml");
            p1.setPrice(1200);
            p1.setStock(50);
            products.add(p1);

            Product p2 = new Product();
            p2.setProductName("Barra de Proteína");
            p2.setPrice(2500);
            p2.setStock(20);
            products.add(p2);

            Product p3 = new Product();
            p3.setProductName("Shaker Nutrición");
            p3.setPrice(7500);
            p3.setStock(10);
            products.add(p3);

            productRepository.saveAll(products);
            System.out.println("✅ Products seeded");
        }

        // 6. Seed Clients if empty
        if (clientRepository.count() == 0) {
            clientRepository.saveAll(Arrays.asList(
                    new Client(null, null, "Carlos", "Perez", "12345678", "1166778899", true, null, new ArrayList<>()),
                    new Client(null, null, "Ana", "Gomez", "23456789", "1133445566", true, null, new ArrayList<>()),
                    new Client(null, null, "Lucas", "Rodriguez", "34567890", "1155443322", false, null,
                            new ArrayList<>())));
            System.out.println("✅ Clients seeded");
        }

        // 7. Seed initial payments if empty
        if (paymentRepository.count() == 0) {
            List<Client> clients = clientRepository.findAll();
            List<Professor> professors = professorRepository.findAll();
            List<MonthlyType> types = monthlyTypeRepository.findAll();

            if (!clients.isEmpty() && !professors.isEmpty() && !types.isEmpty()) {
                Payment p = new Payment();
                p.setClient(clients.get(0));
                p.setProfessor(professors.get(0));
                p.setMonthlyType(types.get(1)); // Full Plan
                p.setAmount(types.get(1).getPrice());
                p.setDate(LocalDate.now().minusDays(5)); // Recent payment
                p.setPaymentType(PaymentType.MONTHLY);
                paymentRepository.save(p);
                System.out.println("✅ Initial payment seeded");
            }
        }
    }
}
