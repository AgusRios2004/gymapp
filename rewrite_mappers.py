import os

# AdministratorMapper
admin_mapper_content = """package com.aplicacionGym.gymapp.modules.core.mapper;

import com.aplicacionGym.gymapp.modules.core.dto.request.AdministratorRequestDTO;
import com.aplicacionGym.gymapp.modules.core.dto.response.AdministratorResponseDTO;
import com.aplicacionGym.gymapp.modules.core.entity.Administrator;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AdministratorMapper {
    AdministratorResponseDTO toDTO(Administrator administrator);
    Administrator toEntity(AdministratorRequestDTO dto);
}
"""

with open('gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/core/mapper/AdministratorMapper.java', 'w') as f:
    f.write(admin_mapper_content)

# AssistanceMapper
assistance_mapper_content = """package com.aplicacionGym.gymapp.modules.attendance.mapper;

import com.aplicacionGym.gymapp.modules.attendance.dto.request.AssistanceRequestDTO;
import com.aplicacionGym.gymapp.modules.attendance.dto.response.AssistanceResponseDTO;
import com.aplicacionGym.gymapp.modules.attendance.entity.Assistance;
import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.core.entity.Person;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssistanceMapper {
    @Mapping(source = "client.id", target = "idClient")
    @Mapping(source = "client.name", target = "clientName")
    @Mapping(source = "staff.id", target = "idProfessor")
    @Mapping(source = "staff.name", target = "professorName")
    AssistanceResponseDTO toDTO(Assistance assistance);

    @Mapping(target = "client", source = "client")
    @Mapping(target = "staff", source = "staff")
    @Mapping(target = "date", source = "dto.date")
    @Mapping(target = "inputHour", source = "dto.inputHour")
    @Mapping(target = "id", ignore = true)
    Assistance toEntity(Client client, Person staff, AssistanceRequestDTO dto);
}
"""

with open('gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/attendance/mapper/AssistanceMapper.java', 'w') as f:
    f.write(assistance_mapper_content)

# PaymentMapper
payment_mapper_content = """package com.aplicacionGym.gymapp.modules.payments.mapper;

import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.core.entity.Professor;
import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.modules.payments.dto.request.MonthlyPaymentRequestDTO;
import com.aplicacionGym.gymapp.modules.payments.dto.request.ProductDetailRequestDTO;
import com.aplicacionGym.gymapp.modules.payments.dto.response.PaymentProductResponseDTO;
import com.aplicacionGym.gymapp.modules.payments.dto.response.PaymentResponseDTO;
import com.aplicacionGym.gymapp.modules.payments.entity.MonthlyType;
import com.aplicacionGym.gymapp.modules.payments.entity.Payment;
import com.aplicacionGym.gymapp.modules.payments.entity.PaymentProduct;
import com.aplicacionGym.gymapp.modules.payments.entity.Product;
import com.aplicacionGym.gymapp.modules.payments.entity.enums.PaymentType;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class PaymentMapper {

    @Mapping(source = "client.id", target = "idCliente")
    @Mapping(target = "clientName", expression = "java(payment.getClient().getName() + \\" \\" + payment.getClient().getLastName())")
    @Mapping(source = "professor.id", target = "idProfessor")
    @Mapping(target = "professorName", expression = "java(payment.getProfessor().getName() + \\" \\" + payment.getProfessor().getLastName())")
    @Mapping(target = "monthlyType", ignore = true)
    @Mapping(target = "monthlyTypeName", ignore = true)
    @Mapping(target = "products", ignore = true)
    public abstract PaymentResponseDTO toDTO(Payment payment);

    @AfterMapping
    protected void addPaymentSpecificData(Payment payment, @MappingTarget PaymentResponseDTO dto) {
        if (payment.getPaymentType() == PaymentType.MONTHLY) {
            dto.setMonthlyType(payment.getMonthlyType().getId());
            dto.setMonthlyTypeName(payment.getMonthlyType().getType());
        } else if (payment.getPaymentType() == PaymentType.PRODUCTS) {
            List<PaymentProductResponseDTO> products = payment.getPaymentProducts().stream()
                .map(this::toProductDTO).toList();
            dto.setProducts(products);
        }
    }

    @Mapping(source = "client", target = "client")
    @Mapping(source = "professor", target = "professor")
    @Mapping(source = "type", target = "monthlyType")
    @Mapping(source = "dto.date", target = "date")
    @Mapping(target = "paymentType", constant = "MONTHLY")
    @Mapping(source = "type.price", target = "amount")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paymentProducts", ignore = true)
    public abstract Payment toMonthlyEntity(MonthlyPaymentRequestDTO dto, Client client, Professor professor, MonthlyType type);

    @Mapping(source = "client", target = "client")
    @Mapping(source = "professor", target = "professor")
    @Mapping(target = "paymentType", constant = "PRODUCTS")
    @Mapping(source = "dto.date", target = "date")
    @Mapping(source = "products", target = "paymentProducts")
    @Mapping(source = "total", target = "amount")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "monthlyType", ignore = true)
    public abstract Payment toProductEntity(MonthlyPaymentRequestDTO dto, Client client, Professor professor, List<PaymentProduct> products, double total);

    @Mapping(source = "product.id", target = "idProduct")
    @Mapping(source = "product.productName", target = "productName")
    public abstract PaymentProductResponseDTO toProductDTO(PaymentProduct paymentProduct);

    public List<PaymentProduct> toPaymentProductList(List<ProductDetailRequestDTO> dto, List<Product> products) {
        return dto.stream().map(details -> {
            Product product = products.stream()
                    .filter(p -> p.getId().equals(details.getIdProduct()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + details.getIdProduct()));

            PaymentProduct paymentProduct = new PaymentProduct();
            paymentProduct.setProduct(product);
            paymentProduct.setQuantity(details.getQuantity());
            paymentProduct.setUnitPrice(details.getUnitPrice());

            return paymentProduct;
        }).toList();
    }
}
"""

with open('gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/payments/mapper/PaymentMapper.java', 'w') as f:
    f.write(payment_mapper_content)
