package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.request.MonthlyPaymentRequestDTO;
import com.aplicacionGym.gymapp.dto.request.ProductPaymentRequestDTO;
import com.aplicacionGym.gymapp.dto.response.PaymentResponseDTO;
import com.aplicacionGym.gymapp.entity.*;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.exception.BusinessRuleException;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.mapper.PaymentMapper;
import com.aplicacionGym.gymapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private ProfessorRepository professorRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private MonthlyTypeRepository monthlyTypeRepository;
    @Autowired
    private PaymentProductRepository paymentProductRepository;

    public PaymentResponseDTO createMonthlyPayment(MonthlyPaymentRequestDTO dto) {
        Client client = clientRepository.findById(dto.getIdClient())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + dto.getIdClient()));
        
        MonthlyType newType = monthlyTypeRepository.findById(dto.getIdMonthlyType())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de plan mensual no encontrado con id: " + dto.getIdMonthlyType()));

        Professor professor = professorRepository.findById(dto.getIdProfessor())
                .orElseThrow(() -> new ResourceNotFoundException("Profesor no encontrado con id: " + dto.getIdProfessor()));

        // Logic check: Does the client already have an active monthly payment?
        java.util.Optional<Payment> activePaymentOpt = paymentRepository
                .findFirstByClientIdAndMonthlyTypeIsNotNullOrderByDateDesc(client.getId());

        double amountToPay = newType.getPrice();
        LocalDate paymentDate = dto.getDate() != null ? dto.getDate() : LocalDate.now();

        if (activePaymentOpt.isPresent()) {
            Payment activePayment = activePaymentOpt.get();
            LocalDate today = LocalDate.now();
            
            // Check if existing payment is still valid (Expiration date in the future)
            if (activePayment.getExpirationDate() != null && activePayment.getExpirationDate().isAfter(today)) {
                
                // CASE 1: Same plan already paid (ERROR)
                if (activePayment.getMonthlyType().getId().equals(newType.getId())) {
                    throw new BusinessRuleException("Ya existe un pago del plan '" +
                        newType.getType() + "' vigente hasta " + activePayment.getExpirationDate() + ".");
                }

                // CASE 2: Upgrade to a better plan (CHARGING DIFFERENCE)
                if (newType.getPrice() > activePayment.getMonthlyType().getPrice()) {
                    amountToPay = newType.getPrice() - activePayment.getMonthlyType().getPrice();
                    // To maintain the billing cycle, we use the original payment date 
                    // so the expiration remains consistent with the original month.
                    paymentDate = activePayment.getDate();
                    System.out.println("💳 Upgrade detected. Original plan: " + activePayment.getMonthlyType().getType() +
                        ". Charging difference: $" + amountToPay);
                } else {
                    // Downgrade or same price but different plan while active - usually not allowed or just warning
                    throw new BusinessRuleException("No se puede cambiar a un plan menor o equivalente mientras el actual esté vigente.");
                }
            }
        }

        Payment payment = new Payment();
        payment.setDate(paymentDate);
        payment.setPaymentType(PaymentType.MONTHLY);
        payment.setMonthlyType(newType);
        payment.setAmount(amountToPay);
        payment.setClient(client);
        payment.setProfessor(professor);

        paymentRepository.save(payment);

        return PaymentMapper.toDTO(payment);
    }

    @Transactional
    public PaymentResponseDTO createProductPayment(ProductPaymentRequestDTO dto) {
        Payment payment = new Payment();
        Client client = clientRepository.findById(dto.getIdClient())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + dto.getIdClient()));
        Professor professor = professorRepository.findById(dto.getIdProfessor())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Profesor no encontrado con id: " + dto.getIdProfessor()));

        payment.setClient(client);
        payment.setProfessor(professor);
        payment.setDate(dto.getDate());
        payment.setPaymentType(PaymentType.PRODUCTS);

        List<Product> products = dto.getProducts().stream().map(productDetailRequestDTO ->
                productRepository.findById(productDetailRequestDTO.getIdProduct())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Producto no encontrado con id: " + productDetailRequestDTO.getIdProduct())))
                .toList();

        // Validar el stock de todos los ítems antes de descontar ninguno.
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            int quantity = dto.getProducts().get(i).getQuantity();
            if (product.getStock() < quantity) {
                throw new BusinessRuleException("Stock insuficiente para el producto: " + product.getProductName());
            }
        }

        List<PaymentProduct> productsPayment = new java.util.ArrayList<>();
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            int quantity = dto.getProducts().get(i).getQuantity();

            product.setStock(product.getStock() - quantity);
            productRepository.save(product);

            PaymentProduct paymentProduct = new PaymentProduct();
            paymentProduct.setProduct(product);
            paymentProduct.setQuantity(quantity);
            paymentProduct.setClient(client);
            paymentProduct.setPayment(payment);
            paymentProduct.setUnitPrice(product.getPrice());

            productsPayment.add(paymentProduct);
        }

        payment.setPaymentProducts(productsPayment);

        double totalAmount = productsPayment.stream()
                .mapToDouble(paymentProduct -> paymentProduct.getUnitPrice() * paymentProduct.getQuantity())
                .sum();

        payment.setAmount(totalAmount);

        paymentRepository.save(payment);
        paymentProductRepository.saveAll(productsPayment);
        return PaymentMapper.toDTO(payment);
    }

    public List<PaymentResponseDTO> getPaymentsByProfessor(Long id) {
        List<Payment> payments = paymentRepository.findByProfessorId(id);
        return payments.stream()
                .map(PaymentMapper::toDTO)
                .toList();
    }

    public List<PaymentResponseDTO> getPaymentsByClient(Long id) {
        List<Payment> payments = paymentRepository.findByClientId(id);
        return payments.stream()
                .map(PaymentMapper::toDTO)
                .toList();
    }

    public List<PaymentResponseDTO> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream()
                .map(PaymentMapper::toDTO)
                .toList();
    }

}
