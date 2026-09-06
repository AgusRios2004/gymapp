package com.aplicacionGym.gymapp.modules.core.controller;

import lombok.RequiredArgsConstructor;
import com.aplicacionGym.gymapp.modules.core.service.ReportService;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

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

    @GetMapping("/monthly-async")
    public java.util.concurrent.CompletableFuture<org.springframework.http.ResponseEntity<byte[]>> generateMonthlyReportAsync() {
        String fileName = "Reporte_GYM_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy_MM_dd_HHmm")) + ".pdf";
        return reportService.generateMonthlyReportAsync()
                .thenApply(bytes -> org.springframework.http.ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                        .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                        .body(bytes));
    }
}
