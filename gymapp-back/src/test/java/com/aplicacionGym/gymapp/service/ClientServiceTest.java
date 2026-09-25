package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.entity.Client;
import com.aplicacionGym.gymapp.entity.Payment;
import com.aplicacionGym.gymapp.repository.ClientRepository;
import com.aplicacionGym.gymapp.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * H-0007-2-01 / AC-0007-03: GET /clients/{id} (ClientService.getClientById) tiene que reportar
 * isDebtor con el mismo criterio que las listas (mapToDTOWithDebtorStatus), no el default de
 * ClientMapper.toDTO, que nunca lo completa.
 */
@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private ClientService clientService;

    @Test
    void h0007_2_01_getClientById_reportaCuotaVencidaComoLasListas() {
        Client client = new Client();
        client.setId(1L);
        client.setName("Carlos");
        client.setLastName("Perez");
        client.setActive(true);

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));

        Payment overduePayment = org.mockito.Mockito.mock(Payment.class);
        lenient().when(overduePayment.getExpirationDate()).thenReturn(LocalDate.now().minusDays(5));
        lenient().when(paymentRepository.findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(1L))
                .thenReturn(Optional.of(overduePayment));

        ClientResponseDTO dto = clientService.getClientById(1L).orElseThrow();

        assertThat(dto.isDebtor())
                .as("un alumno activo con la última cuota vencida tiene que llegar como isDebtor=true "
                        + "en el detalle del cliente, igual que en las listas")
                .isTrue();
    }
}
