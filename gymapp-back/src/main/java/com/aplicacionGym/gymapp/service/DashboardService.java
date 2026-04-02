package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.response.DashboardStatsDTO;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import com.aplicacionGym.gymapp.repository.ProfessorRepository;
import com.aplicacionGym.gymapp.repository.RoutineRepository;
import com.aplicacionGym.gymapp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.Payment;

@Service
public class DashboardService {

    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private ProfessorRepository professorRepository;
    @Autowired
    private RoutineRepository routineRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private ProductRepository productRepository;

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalClients(clientRepository.count());
        stats.setActiveClients(clientRepository.countByActive(true));
        stats.setTotalProfessors(professorRepository.count());
        stats.setTotalRoutines(routineRepository.count());

        // Sum current month's revenue (simplified)
        Double revenue = paymentRepository.sumAmountByMonth(LocalDate.now().getMonthValue());
        stats.setMonthlyRevenue(revenue != null ? revenue : 0.0);

        // Count low stock products
        stats.setLowStockCount(productRepository.countByStockLessThan(5));

        // Calculate Debtors
        List<Client> activeClients = clientRepository.findByActiveTrue();
        long debtors = 0;
        for (Client c : activeClients) {
            Optional<Payment> lastPayment = paymentRepository
                    .findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(c.getId());
            if (lastPayment.isEmpty()) {
                debtors++; // Activo pero nunca pago
            } else {
                LocalDate expirationDate = lastPayment.get().getExpirationDate();
                if (expirationDate == null || expirationDate.isBefore(LocalDate.now())) {
                    debtors++;
                }
            }
        }
        stats.setDebtorsCount(debtors);

        return stats;
    }
}
