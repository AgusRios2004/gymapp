package com.aplicacionGym.gymapp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.aplicacionGym.gymapp.controller.ReportController;
import com.aplicacionGym.gymapp.dto.response.DashboardStatsDTO;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;

/**
 * Spec 0010: el PDF de cierre sale con la hora de Argentina y con los montos en formato argentino
 * (antes "Emitido el" corría 3 horas y los montos salían como $150000.00).
 */
@ExtendWith(MockitoExtension.class)
class ReportClockAndMoneyTest {

    // 24/09/2026 21:40 en Argentina.
    @Spy
    private Clock clock = Clock.fixed(Instant.parse("2026-09-25T00:40:00Z"), ZoneId.of("America/Argentina/Buenos_Aires"));

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private ReportService reportService;

    @Mock
    private ReportService reportServiceMock;

    @Test
    @DisplayName("AC-0010-10: el PDF muestra montos argentinos y la hora de Argentina")
    void ac_0010_10_elPdfMuestraMontosArgentinosYLaHoraDeArgentina() throws Exception {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setMonthlyRevenue(150000);
        stats.setActiveClients(8);
        when(dashboardService.getDashboardStats()).thenReturn(stats);
        MockHttpServletResponse response = new MockHttpServletResponse();

        reportService.generateMonthlyReport(response);

        String text = new PdfTextExtractor(new PdfReader(response.getContentAsByteArray())).getTextFromPage(1);
        assertThat(text).contains("$150.000", "$18.750", "Emitido el: 24/09/2026 21:40 hs");
        assertThat(text).doesNotContain("150000.00");
    }

    @Test
    @DisplayName("AC-0010-11: el archivo del PDF se nombra con la fecha y hora de Argentina")
    void ac_0010_11_elArchivoDelPdfSeNombraConLaFechaYHoraDeArgentina() throws Exception {
        ReportController controller = new ReportController();
        ReflectionTestUtils.setField(controller, "reportService", reportServiceMock);
        ReflectionTestUtils.setField(controller, "clock", clock);

        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(get("/api/reports/monthly"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=Reporte_GYM_2026_09_24_2140.pdf"));
    }
}
