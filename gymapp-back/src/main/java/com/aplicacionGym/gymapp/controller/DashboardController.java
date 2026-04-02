package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.DashboardStatsDTO;
import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<WebApiResponse> getStats() {
        DashboardStatsDTO stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(WebApiResponseBuilder.success("Dashboard stats fetched successfully", stats));
    }
}
