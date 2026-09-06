package com.aplicacionGym.gymapp.modules.clients.mapper;

import com.aplicacionGym.gymapp.modules.clients.dto.request.ClientRequestDTO;
import com.aplicacionGym.gymapp.modules.clients.dto.response.ClientResponseDTO;
import com.aplicacionGym.gymapp.modules.clients.entity.Client;
import com.aplicacionGym.gymapp.modules.routines.mapper.RoutineMapper;
import com.aplicacionGym.gymapp.modules.payments.entity.PaymentProduct;
import com.aplicacionGym.gymapp.modules.payments.dto.response.ProductsPurchasedResponseDTO;

import org.mapstruct.Mapper;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {RoutineMapper.class})
public interface ClientMapper {

    @Mapping(target = "routineActive", source = "routineActive")
    @Mapping(target = "activeClassId", source = "activeClass.id")
    @Mapping(target = "activeClassName", source = "activeClass.className")
    @Mapping(target = "debtor", ignore = true)
    ClientResponseDTO toDTO(Client client);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "activeClass", ignore = true)
    @Mapping(target = "routines", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "routineActive", ignore = true)
    Client toEntity(ClientRequestDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(Client dto, @MappingTarget Client entity);
    
    @Mapping(source = "product.productName", target = "nameProduct")
    @Mapping(source = "payment.date", target = "date")
    ProductsPurchasedResponseDTO toProductsPurchasedResponseDTO(PaymentProduct paymentProduct);
}
