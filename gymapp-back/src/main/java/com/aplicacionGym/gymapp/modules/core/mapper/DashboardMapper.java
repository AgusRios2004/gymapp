package com.aplicacionGym.gymapp.modules.core.mapper;

import com.aplicacionGym.gymapp.modules.core.dto.response.DashboardStatsDTO;
import org.springframework.stereotype.Component;

@Component
public class DashboardMapper {
    public DashboardStatsDTO toDashboardStatsDTO(long totalClients, long activeClients, long totalProfessors, long totalRoutines, double monthlyRevenue, long lowStockCount, long debtorsCount) {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalClients(totalClients);
        stats.setActiveClients(activeClients);
        stats.setTotalProfessors(totalProfessors);
        stats.setTotalRoutines(totalRoutines);
        stats.setMonthlyRevenue(monthlyRevenue);
        stats.setLowStockCount(lowStockCount);
        stats.setDebtorsCount(debtorsCount);
        return stats;
    }
}
