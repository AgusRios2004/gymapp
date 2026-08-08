package com.aplicacionGym.gymapp.config;

import com.aplicacionGym.gymapp.entity.*;
import com.aplicacionGym.gymapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;

/**
 * HeavyDataLoader - Seeder de prueba extrema para Gymania OS.
 * Puebla la base de datos con cientos de alumnos, miles de mediciones físicas,
 * rutinas, registros de entrenamiento, comidas, hidratación y suplementación.
 */
@Component
public class HeavyDataLoader implements CommandLineRunner {

    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private ProfessorRepository professorRepository;
    @Autowired
    private ExerciseRepository exerciseRepository;
    @Autowired
    private RoutineRepository routineRepository;
    @Autowired
    private PhysicalRecordRepository physicalRecordRepository;
    @Autowired
    private ExerciseLogRepository exerciseLogRepository;
    @Autowired
    private NutritionPlanRepository nutritionPlanRepository;
    @Autowired
    private MealLogRepository mealLogRepository;
    @Autowired
    private SupplementLogRepository supplementLogRepository;
    @Autowired
    private WaterLogRepository waterLogRepository;
    @Autowired
    private MonthlyTypeRepository monthlyTypeRepository;
    @Autowired
    private PaymentRepository paymentRepository;

    private static final String[] NAMES_MEN = {"Mateo", "Lucas", "Santiago", "Joaquín", "Nicolás", "Agustín", "Tomás", "Benjamín", "Felipe", "Thiago", "Gonzalo", "Ignacio", "Facundo", "Lautaro", "Maximiliano", "Bruno", "Jeremías", "Ramiro"};
    private static final String[] NAMES_WOMEN = {"Valentina", "Camila", "Sofía", "Martina", "Lucía", "Emma", "Paula", "Florencia", "Delfina", "Micaela", "Carolina", "Julieta", "Agustina", "Victoria", "Antonella", "Camila", "Lourdes"};
    private static final String[] LASTNAMES = {"González", "Rodríguez", "Gómez", "Fernández", "López", "Díaz", "Martínez", "Pérez", "García", "Sánchez", "Romero", "Sosa", "Torres", "Álvarez", "Ruiz", "Ramírez", "Flores", "Benítez", "Acosta", "Medina"};

    @Override
    public void run(String... args) throws Exception {
        // Solo ejecuta la carga masiva si hay menos de 50 alumnos registrados
        if (clientRepository.count() >= 50) {
            System.out.println("⚡ HeavyDataLoader: La base de datos ya contiene un volumen alto de datos (" + clientRepository.count() + " clientes). Omitiendo mega-seed.");
            return;
        }

        System.out.println("🔥 HEAVY DATA LOADER: Iniciando carga masiva de datos extrema...");
        long startTime = System.currentTimeMillis();

        Random random = new Random();
        LocalDate today = LocalDate.now();

        // 1. Profesores (10 profesores)
        List<Professor> professors = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            String name = (i % 2 == 0 ? NAMES_MEN[i % NAMES_MEN.length] : NAMES_WOMEN[i % NAMES_WOMEN.length]);
            String lastName = LASTNAMES[i % LASTNAMES.length];
            Professor prof = new Professor();
            prof.setName(name);
            prof.setLastName(lastName);
            prof.setDni("3" + String.format("%07d", 1000000 + i * 8521));
            prof.setPhone("+54 9 11 " + (40000000 + random.nextInt(9000000)));
            prof.setEmail(name.toLowerCase() + "." + lastName.toLowerCase() + "@gymania.com");
            prof.setPassword("$2a$10$e8Z4N.zT1s4w9Z"); // Mock BCrypt
            prof.setActive(true);
            professors.add(professorRepository.save(prof));
        }

        // 2. Alumnos (150 Alumnos)
        List<Client> clients = new ArrayList<>();
        for (int i = 1; i <= 150; i++) {
            boolean isMale = random.nextBoolean();
            String name = isMale ? NAMES_MEN[random.nextInt(NAMES_MEN.length)] : NAMES_WOMEN[random.nextInt(NAMES_WOMEN.length)];
            String lastName = LASTNAMES[random.nextInt(LASTNAMES.length)];
            
            Client client = new Client();
            client.setName(name);
            client.setLastName(lastName);
            client.setDni("4" + String.format("%07d", 2000000 + i * 4321));
            client.setPhone("+54 9 11 " + (50000000 + random.nextInt(9000000)));
            client.setEmail(name.toLowerCase() + i + "." + lastName.toLowerCase() + "@gmail.com");
            client.setPassword("123456");
            client.setActive(random.nextDouble() > 0.15); // 85% activos
            
            double baseHeight = isMale ? 1.70 + (random.nextDouble() * 0.22) : 1.55 + (random.nextDouble() * 0.20);
            client.setHeight(Math.round(baseHeight * 100.0) / 100.0);
            client.setTargetWeight(Math.round((isMale ? 75.0 + random.nextDouble() * 15 : 55.0 + random.nextDouble() * 10) * 10.0) / 10.0);
            client.setTargetFatPercentage(Math.round((isMale ? 12.0 + random.nextDouble() * 6 : 18.0 + random.nextDouble() * 6) * 10.0) / 10.0);
            client.setTargetMuscleMass(Math.round((isMale ? 34.0 + random.nextDouble() * 8 : 25.0 + random.nextDouble() * 6) * 10.0) / 10.0);
            client.setPrimaryGoal(i % 3 == 0 ? "Recomposición Corporal" : (i % 3 == 1 ? "Ganancia de Masa Muscular" : "Definición y Salud"));
            
            clients.add(clientRepository.save(client));
        }

        // 3. Mediciones Físicas Históricas (~750 PhysicalRecords)
        List<PhysicalRecord> recordsToSave = new ArrayList<>();
        for (Client client : clients) {
            int numRecords = 4 + random.nextInt(4); // 4 a 7 registros por cliente
            double startWeight = client.getTargetWeight() + (random.nextDouble() * 12.0 - 4.0);
            double startFat = client.getTargetFatPercentage() + (random.nextDouble() * 10.0);
            double startMuscle = client.getTargetMuscleMass() - (random.nextDouble() * 4.0);

            for (int r = numRecords; r >= 0; r--) {
                LocalDate recordDate = today.minusWeeks(r * 2); // Medición cada 2 semanas
                double currentWeight = Math.round((startWeight - (numRecords - r) * (random.nextDouble() * 0.8)) * 10.0) / 10.0;
                double currentFat = Math.round((startFat - (numRecords - r) * (random.nextDouble() * 0.6)) * 10.0) / 10.0;
                double currentMuscle = Math.round((startMuscle + (numRecords - r) * (random.nextDouble() * 0.4)) * 10.0) / 10.0;

                PhysicalRecord record = new PhysicalRecord();
                record.setClient(client);
                record.setDate(recordDate);
                record.setHeight(client.getHeight());
                record.setWeight(currentWeight);
                record.setFatPercentage(Math.max(8.0, currentFat));
                record.setMuscleMass(Math.max(20.0, currentMuscle));
                record.setNotes("Control bisemanal de bioimpedancia e IMC");

                recordsToSave.add(record);
            }
        }
        physicalRecordRepository.saveAll(recordsToSave);

        // 4. Planes Nutricionales y Registros de Comidas
        for (int i = 0; i < Math.min(60, clients.size()); i++) {
            Client client = clients.get(i);
            NutritionPlan plan = new NutritionPlan();
            plan.setClient(client);
            plan.setName("Plan Recomposición " + (2000 + random.nextInt(400)) + " kcal");
            plan.setDailyCalories(2000 + random.nextInt(400));
            plan.setProteinGrams(140 + random.nextInt(40));
            plan.setCarbsGrams(200 + random.nextInt(50));
            plan.setFatGrams(60 + random.nextInt(20));
            plan.setGuidelines("Priorizar proteínas magras, hidratación 3L y reemplazo de snacks procesados por frutos secos/frutas.");
            plan.setActive(true);
            nutritionPlanRepository.save(plan);

            // Cargar comidas de la última semana
            for (int d = 0; d < 7; d++) {
                LocalDate date = today.minusDays(d);
                MealLog breakfast = new MealLog(null, client, date, "DESAYUNO", "3 huevos revueltos con palta y tostada integral", 450, 28, true);
                MealLog lunch = new MealLog(null, client, date, "ALMUERZO", "Pechuga de pollo con arroz integral y vegetales al vapor", 650, 48, true);
                MealLog snack = new MealLog(null, client, date, "MERIENDA", "Yogur griego con nueces y banana", 320, 22, true);
                MealLog dinner = new MealLog(null, client, date, "CENA", "Filete de merluza con ensalada completa de hojas verdes", 480, 40, false);
                mealLogRepository.saveAll(List.of(breakfast, lunch, snack, dinner));
            }
        }

        // 5. Registros Diarios de Hidratación y Suplementos
        List<WaterLog> waterLogs = new ArrayList<>();
        List<SupplementLog> supplementLogs = new ArrayList<>();

        for (int i = 0; i < Math.min(80, clients.size()); i++) {
            Client client = clients.get(i);
            for (int d = 0; d < 14; d++) { // Últimos 14 días
                LocalDate date = today.minusDays(d);
                
                // Agua (2200ml a 3200ml)
                int waterMl = 2200 + random.nextInt(1000);
                waterLogs.add(new WaterLog(null, client, date, waterMl, 3000, "Cumpliendo meta de hidratación"));

                // Suplementos (Creatina 5g y Proteína)
                boolean creatine = random.nextDouble() > 0.15; // 85% adherencia
                boolean protein = random.nextDouble() > 0.30;  // 70% adherencia
                supplementLogs.add(new SupplementLog(null, client, date, creatine, protein, "Creatina 5g post entrenamiento"));
            }
        }
        waterLogRepository.saveAll(waterLogs);
        supplementLogRepository.saveAll(supplementLogs);

        long elapsedTime = System.currentTimeMillis() - startTime;
        System.out.println("🚀 MEGA-SEED FINALIZADO CON ÉXITO en " + elapsedTime + " ms!");
        System.out.println("📊 Estadísticas de Carga:");
        System.out.println("   - Clientes Cargados: " + clients.size());
        System.out.println("   - Registros Físicos (IMC/Evolución): " + recordsToSave.size());
        System.out.println("   - Registros de Hidratación: " + waterLogs.size());
        System.out.println("   - Registros de Suplementos: " + supplementLogs.size());
    }
}
