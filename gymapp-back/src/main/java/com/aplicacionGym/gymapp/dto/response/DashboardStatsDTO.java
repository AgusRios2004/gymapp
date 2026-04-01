package com.aplicacionGym.gymapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDTO {
    private long totalClients;
    private long activeClients;
    private long totalProfessors;
    private long totalRoutines;
    private double monthlyRevenue;
    private long lowStockCount;
}
