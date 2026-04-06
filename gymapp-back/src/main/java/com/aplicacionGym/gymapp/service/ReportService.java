package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.response.DashboardStatsDTO;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ReportService {

        @Autowired
        private DashboardService dashboardService;

        public void generateMonthlyReport(HttpServletResponse response) throws IOException {
                DashboardStatsDTO stats = dashboardService.getDashboardStats();

                Document document = new Document(PageSize.A4);
                PdfWriter.getInstance(document, response.getOutputStream());

                document.open();

                // Fuentes
                Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.BLACK);
                Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.GRAY);
                Font metricValueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(59, 130, 246));

                // Título principal
                Paragraph title = new Paragraph("Reporte de Cierre de Mes - GYM APP", titleFont);
                title.setAlignment(Paragraph.ALIGN_CENTER);
                title.setSpacingAfter(10);
                document.add(title);

                // Fecha de emisión
                Paragraph date = new Paragraph(
                                "Emitido el: " + LocalDateTime.now()
                                                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + " hs",
                                subTitleFont);
                date.setAlignment(Paragraph.ALIGN_CENTER);
                date.setSpacingAfter(30);
                document.add(date);

                // Resumen Ejecutivo
                Paragraph sectionHeader = new Paragraph("Resumen Ejecutivo", subTitleFont);
                sectionHeader.setSpacingAfter(15);
                document.add(sectionHeader);

                // Tabla de Métricas
                PdfPTable table = new PdfPTable(2);
                table.setWidthPercentage(100f);
                table.setSpacingBefore(10);

                addMetricCell(table, "Total Alumnos", String.valueOf(stats.getTotalClients()), metricValueFont);
                addMetricCell(table, "Alumnos Activos", String.valueOf(stats.getActiveClients()), metricValueFont);
                addMetricCell(table, "Total Profesores", String.valueOf(stats.getTotalProfessors()), metricValueFont);
                addMetricCell(table, "Rutinas Creadas", String.valueOf(stats.getTotalRoutines()), metricValueFont);
                addMetricCell(table, "Ingresos Mensuales", "$" + String.format("%.2f", stats.getMonthlyRevenue()),
                                metricValueFont);
                addMetricCell(table, "Promedio por Cliente",
                                "$" + String.format("%.2f",
                                                stats.getMonthlyRevenue() / (stats.getActiveClients() > 0
                                                                ? stats.getActiveClients()
                                                                : 1)),
                                metricValueFont);

                document.add(table);

                // Pie de página
                Paragraph footer = new Paragraph(
                                "\n\nEste reporte es generado de forma automática por el sistema de gestión del gimnasio.",
                                FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY));
                footer.setAlignment(Paragraph.ALIGN_CENTER);
                document.add(footer);

                document.close();
        }

        private void addMetricCell(PdfPTable table, String label, String value, Font valueFont) {
                PdfPCell labelCell = new PdfPCell(
                                new Phrase(label,
                                                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY)));
                labelCell.setBorder(Rectangle.NO_BORDER);
                labelCell.setPadding(15);
                labelCell.setBackgroundColor(new Color(243, 244, 246));

                PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
                valueCell.setBorder(Rectangle.NO_BORDER);
                valueCell.setPadding(15);
                valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                valueCell.setBackgroundColor(new Color(243, 244, 246));

                table.addCell(labelCell);
                table.addCell(valueCell);

                // Fila vacía para espacio
                PdfPCell spacer = new PdfPCell(new Phrase(" "));
                spacer.setBorder(Rectangle.NO_BORDER);
                spacer.setColspan(2);
                spacer.setFixedHeight(10);
                table.addCell(spacer);
        }
}
