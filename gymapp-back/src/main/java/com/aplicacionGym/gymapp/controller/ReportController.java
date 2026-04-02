package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.service.ReportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/monthly")
    public void generateMonthlyReport(HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        String headerKey = "Content-Disposition";
        String fileName = "Reporte_GYM_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy_MM_dd_HHmm"))
                + ".pdf";
        String headerValue = "attachment; filename=" + fileName;
        response.setHeader(headerKey, headerValue);

        reportService.generateMonthlyReport(response);
    }
}
