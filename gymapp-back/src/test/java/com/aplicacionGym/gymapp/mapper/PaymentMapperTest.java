package com.aplicacionGym.gymapp.mapper;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.aplicacionGym.gymapp.dto.request.ProductDetailRequestDTO;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;

/**
 * Spec 0015 (BUG-26): el mensaje de producto inexistente del mapper también está en español. Hoy
 * la venta lo detecta antes, en PaymentService, y este camino no se usa.
 */
class PaymentMapperTest {

    @Test
    @DisplayName("AC-0015-09 (mapper): un ítem de un producto que no está en la lista dice cuál en español")
    void ac_0015_09_elProductoQueNoEstaEnLaListaSeNombraEnEspanol() {
        ProductDetailRequestDTO item = new ProductDetailRequestDTO();
        item.setIdProduct(999999L);
        item.setQuantity(1);

        assertThatThrownBy(() -> PaymentMapper.toPaymentProductList(List.of(item), List.of()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Producto no encontrado con id: 999999");
    }
}
