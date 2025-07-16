package com.aplicacionGym.gymapp.mapper;

import com.aplicacionGym.gymapp.dto.request.MonthlyPaymentRequestDTO;
import com.aplicacionGym.gymapp.dto.request.ProductDetailRequestDTO;
import com.aplicacionGym.gymapp.dto.request.ProductPaymentRequestDTO;
import com.aplicacionGym.gymapp.dto.response.PaymentProductResponseDTO;
import com.aplicacionGym.gymapp.dto.response.PaymentResponseDTO;
import com.aplicacionGym.gymapp.entity.*;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PaymentMapper {

    public static PaymentResponseDTO toDTO(Payment payment){
        PaymentResponseDTO paymentResponseDTO = new PaymentResponseDTO();

        paymentResponseDTO.setId(payment.getId());
        paymentResponseDTO.setAmount(payment.getAmount());
        paymentResponseDTO.setDate(payment.getDate());
        paymentResponseDTO.setIdCliente(payment.getClient().getId());
        paymentResponseDTO.setIdProfessor(payment.getProfessor().getId());

        if(payment.getPaymentType() == PaymentType.MONTHLY){
            paymentResponseDTO.setMonthlyType(payment.getMonthlyType().getId());
        }else if(payment.getPaymentType() == PaymentType.PRODUCTS){
            List<PaymentProductResponseDTO> products = payment.getPaymentProducts().stream().map(paymentProduct -> {
                PaymentProductResponseDTO paymentProductResponseDTO = new PaymentProductResponseDTO();

                paymentProductResponseDTO.setIdProduct(paymentProduct.getId());
                paymentProductResponseDTO.setProductName(paymentProduct.getProduct().getProductName());
                paymentProductResponseDTO.setQuantity(paymentProductResponseDTO.getQuantity());
                paymentProductResponseDTO.setUnitPrice(paymentProductResponseDTO.getUnitPrice());

                return paymentProductResponseDTO;

            }).toList();

        paymentResponseDTO.setProducts(products);

        }
        return paymentResponseDTO;
    }

    public static Payment toMonthlyEntity(MonthlyPaymentRequestDTO dto, Client client, Professor professor, MonthlyType type){
        Payment payment = new Payment();

        payment.setClient(client);
        payment.setProfessor(professor);
        payment.setMonthlyType(type);
        payment.setDate(dto.getDate());
        payment.setPaymentType(PaymentType.MONTHLY);
        payment.setAmount(type.getPrice());
        return payment;
    }

    public static Payment toProductEntity(MonthlyPaymentRequestDTO dto, Client client, Professor professor, List<PaymentProduct> products, double total){
        Payment payment = new Payment();

        payment.setClient(client);
        payment.setProfessor(professor);
        payment.setPaymentType(PaymentType.PRODUCTS);
        payment.setDate(dto.getDate());
        payment.setPaymentProducts(products);
        payment.setAmount(total);
        return payment;
    }

    public static List<PaymentProduct> toPaymentProductList(List<ProductDetailRequestDTO> dto, List<Product> products){
        return dto.stream().map(details -> {
            Product product = products.stream()
                    .filter(p -> p.getId().equals(details.getIdProduct()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " +details.getIdProduct()));

            PaymentProduct paymentProduct = new PaymentProduct();
            paymentProduct.setProduct(product);
            paymentProduct.setQuantity(details.getQuantity());
            paymentProduct.setUnitPrice(details.getUnitPrice());

            return paymentProduct;
        }).toList();
    }

    public static PaymentProductResponseDTO toProductDTO(PaymentProduct paymentProduct){
        PaymentProductResponseDTO paymentProductResponseDTO = new PaymentProductResponseDTO();

        paymentProductResponseDTO.setQuantity(paymentProductResponseDTO.getQuantity());
        paymentProductResponseDTO.setUnitPrice(paymentProduct.getUnitPrice());
        paymentProductResponseDTO.setProductName(paymentProduct.getProduct().getProductName());
        paymentProductResponseDTO.setIdProduct(paymentProduct.getId());

        return paymentProductResponseDTO;
    }


}
