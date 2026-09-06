package com.aplicacionGym.gymapp.modules.core.service;

import lombok.RequiredArgsConstructor;
import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.clients.repository.ClientRepository;
import com.aplicacionGym.gymapp.modules.core.dto.response.DashboardStatsDTO;
import com.aplicacionGym.gymapp.modules.core.mapper.DashboardMapper;
import com.aplicacionGym.gymapp.modules.core.repository.ProfessorRepository;
import com.aplicacionGym.gymapp.modules.payments.entity.Payment;
import com.aplicacionGym.gymapp.modules.payments.repository.PaymentRepository;
import com.aplicacionGym.gymapp.modules.payments.repository.ProductRepository;
import com.aplicacionGym.gymapp.modules.routines.repository.RoutineRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClientRepository clientRepository;
    private final ProfessorRepository professorRepository;
    private final RoutineRepository routineRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;

    private final DashboardMapper dashboardMapper;

    public DashboardStatsDTO getDashboardStats() {
        long totalClients = clientRepository.count();
        long activeClients = clientRepository.countByActive(true);
        long totalProfessors = professorRepository.count();
        long totalRoutines = routineRepository.count();
        Double revenue = paymentRepository.sumAmountByMonth(LocalDate.now().getMonthValue());
        double monthlyRevenue = revenue != null ? revenue : 0.0;
        long lowStockCount = productRepository.countByStockLessThan(5);

        // Calculate Debtors
        List<Client> activeClientsList = clientRepository.findByActiveTrue();
        long debtors = 0;
        for (Client c : activeClientsList) {
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
        return dashboardMapper.toDashboardStatsDTO(totalClients, activeClients, totalProfessors, totalRoutines, monthlyRevenue, lowStockCount, debtors);
    }
}
