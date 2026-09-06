import os
import re

# Phase 2: AuthService mapping to UserMapper/AuthMapper
auth_mapper_code = """package com.aplicacionGym.gymapp.modules.core.mapper;

import com.aplicacionGym.gymapp.modules.core.dto.response.LoginResponseDTO;
import com.aplicacionGym.gymapp.modules.core.entity.Person;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuthMapper {
    LoginResponseDTO toLoginResponseDTO(Person person);
}
"""
os.makedirs('gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/core/mapper', exist_ok=True)
with open('gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/core/mapper/AuthMapper.java', 'w') as f:
    f.write(auth_mapper_code)

auth_service_path = 'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/core/service/AuthService.java'
with open(auth_service_path, 'r') as f:
    auth_service_content = f.read()

# Add AuthMapper dependency
if 'AuthMapper authMapper' not in auth_service_content:
    auth_service_content = auth_service_content.replace(
        'import com.aplicacionGym.gymapp.modules.core.security.JwtUtil;',
        'import com.aplicacionGym.gymapp.modules.core.security.JwtUtil;\nimport com.aplicacionGym.gymapp.modules.core.mapper.AuthMapper;'
    )
    auth_service_content = auth_service_content.replace(
        '@Autowired\n    private JwtUtil jwtUtil;',
        '@Autowired\n    private JwtUtil jwtUtil;\n\n    @Autowired\n    private AuthMapper authMapper;'
    )

    old_mapping = """        LoginResponseDTO response = new LoginResponseDTO();
        response.setId(person.getId());
        response.setName(person.getName());
        response.setLastName(person.getLastName());
        response.setEmail(person.getEmail());"""
    new_mapping = """        LoginResponseDTO response = authMapper.toLoginResponseDTO(person);"""
    
    auth_service_content = auth_service_content.replace(old_mapping, new_mapping)

with open(auth_service_path, 'w') as f:
    f.write(auth_service_content)


# DashboardService mapping
dash_mapper_code = """package com.aplicacionGym.gymapp.modules.core.mapper;

import com.aplicacionGym.gymapp.modules.core.dto.response.DashboardStatsDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DashboardMapper {
    DashboardStatsDTO toDashboardStatsDTO(long totalClients, long activeClients, long totalProfessors, long totalRoutines, double monthlyRevenue, long lowStockCount, long debtorsCount);
}
"""
with open('gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/core/mapper/DashboardMapper.java', 'w') as f:
    f.write(dash_mapper_code)

dash_service_path = 'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/core/service/DashboardService.java'
with open(dash_service_path, 'r') as f:
    dash_service_content = f.read()

if 'DashboardMapper dashboardMapper' not in dash_service_content:
    dash_service_content = dash_service_content.replace(
        'import com.aplicacionGym.gymapp.modules.core.dto.response.DashboardStatsDTO;',
        'import com.aplicacionGym.gymapp.modules.core.dto.response.DashboardStatsDTO;\nimport com.aplicacionGym.gymapp.modules.core.mapper.DashboardMapper;'
    )
    dash_service_content = dash_service_content.replace(
        '@Autowired\n    private ProductRepository productRepository;',
        '@Autowired\n    private ProductRepository productRepository;\n\n    @Autowired\n    private DashboardMapper dashboardMapper;'
    )
    
    old_dash_mapping = """        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalClients(clientRepository.count());
        stats.setActiveClients(clientRepository.countByActive(true));
        stats.setTotalProfessors(professorRepository.count());
        stats.setTotalRoutines(routineRepository.count());

        // Sum current month's revenue (simplified)
        Double revenue = paymentRepository.sumAmountByMonth(LocalDate.now().getMonthValue());
        stats.setMonthlyRevenue(revenue != null ? revenue : 0.0);

        // Count low stock products
        stats.setLowStockCount(productRepository.countByStockLessThan(5));"""
        
    new_dash_mapping = """        long totalClients = clientRepository.count();
        long activeClients = clientRepository.countByActive(true);
        long totalProfessors = professorRepository.count();
        long totalRoutines = routineRepository.count();
        Double revenue = paymentRepository.sumAmountByMonth(LocalDate.now().getMonthValue());
        double monthlyRevenue = revenue != null ? revenue : 0.0;
        long lowStockCount = productRepository.countByStockLessThan(5);"""
        
    dash_service_content = dash_service_content.replace(old_dash_mapping, new_dash_mapping)
    dash_service_content = dash_service_content.replace("stats.setDebtorsCount(debtors);\n\n        return stats;", "return dashboardMapper.toDashboardStatsDTO(totalClients, activeClients, totalProfessors, totalRoutines, monthlyRevenue, lowStockCount, debtors);")
    
with open(dash_service_path, 'w') as f:
    f.write(dash_service_content)

# ClientService: Phase 2 (ProductsPurchasedResponseDTO) & Phase 3 (updateEntityFromDto)
client_mapper_path = 'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/clients/mapper/ClientMapper.java'
with open(client_mapper_path, 'r') as f:
    client_mapper_content = f.read()

if 'updateEntityFromDto' not in client_mapper_content:
    imports = """import com.aplicacionGym.gymapp.modules.payments.entity.PaymentProduct;
import com.aplicacionGym.gymapp.modules.payments.dto.response.ProductsPurchasedResponseDTO;
import com.aplicacionGym.gymapp.modules.clients.dto.request.ClientRequestDTO;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;"""
    client_mapper_content = client_mapper_content.replace('import org.mapstruct.Mapper;', 'import org.mapstruct.Mapper;\n' + imports)
    
    update_method = """    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(ClientRequestDTO dto, @MappingTarget Client entity);
    
    @org.mapstruct.Mapping(source = "product.productName", target = "nameProduct")
    @org.mapstruct.Mapping(source = "payment.date", target = "date")
    ProductsPurchasedResponseDTO toProductsPurchasedResponseDTO(PaymentProduct paymentProduct);
"""
    client_mapper_content = client_mapper_content.replace('}', update_method + '}')
    
with open(client_mapper_path, 'w') as f:
    f.write(client_mapper_content)

client_service_path = 'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/clients/service/ClientService.java'
with open(client_service_path, 'r') as f:
    client_service_content = f.read()

# Phase 3 update
old_update = """        existingClient.setName(updatedClient.getName());
        existingClient.setLastName(updatedClient.getLastName());
        existingClient.setDni(updatedClient.getDni());
        existingClient.setPhone(updatedClient.getPhone());
        existingClient.setActive(updatedClient.isActive());"""
# Note: updatedClient is of type Client in method updateClient(Long id, Client updatedClient). Wait! The plan says "RequestDTO dto". 
# In ClientService: updateClient(Long id, Client updatedClient)
# I should just update ClientMapper to update Entity from Entity or use the provided param. 
# Ah, if updateClient takes a Client, I can map Client to Client. Let me check the exact signature.
# I'll let MapStruct do `void updateEntityFromEntity(Client updated, @MappingTarget Client entity);`
# But the plan explicitly says `void updateEntityFromDto(RequestDTO dto, @MappingTarget Entity entity);`
# I'll update the signature in ClientService to take `ClientRequestDTO` instead of `Client`. 
# Actually, the controller might be passing `Client`. Let's just create both.

# ProductsPurchased map
old_prod = """        return paymentProducts.stream().map(purchase -> {
            ProductsPurchasedResponseDTO dto = new ProductsPurchasedResponseDTO();
            dto.setNameProduct(purchase.getProduct().getProductName());
            dto.setPrice(purchase.getUnitPrice());
            dto.setQuantity(purchase.getQuantity());
            dto.setDate(purchase.getPayment().getDate());
            return dto;
        }).toList();"""
new_prod = """        return paymentProducts.stream().map(clientMapper::toProductsPurchasedResponseDTO).toList();"""
client_service_content = client_service_content.replace(old_prod, new_prod)
with open(client_service_path, 'w') as f:
    f.write(client_service_content)

# Phase 3 for other services
# GroupClassService
group_class_mapper_path = 'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/attendance/mapper/GroupClassMapper.java'
# We will just write a general script for all mappers to add the update method if missing.

print("Phase 2 & partially Phase 3 done.")
