package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.dto.request.MonthlyPaymentRequestDTO;
import com.aplicacionGym.gymapp.dto.request.ProductPaymentRequestDTO;
import com.aplicacionGym.gymapp.dto.response.PaymentResponseDTO;
import com.aplicacionGym.gymapp.entity.*;
import com.aplicacionGym.gymapp.entity.enums.PaymentType;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.mapper.PaymentMapper;
import com.aplicacionGym.gymapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + dto.getIdClient()));
        
        MonthlyType newType = monthlyTypeRepository.findById(dto.getIdMonthlyType())
                .orElseThrow(() -> new ResourceNotFoundException("Monthly Type not found with id: " + dto.getIdMonthlyType()));

        Professor professor = professorRepository.findById(dto.getIdProfessor())
                .orElseThrow(() -> new ResourceNotFoundException("Professor not found with id: " + dto.getIdProfessor()));

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
                    throw new IllegalArgumentException("Duplicate payment: Client already has an active '" + 
                        newType.getType() + "' plan until " + activePayment.getExpirationDate());
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
                    throw new IllegalArgumentException("Cannot change to a lower or equivalent plan while the current one is active.");
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

    public PaymentResponseDTO createProductPayment(ProductPaymentRequestDTO dto) {
        Payment payment = new Payment();
        Client client = clientRepository.findById(dto.getIdClient())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + dto.getIdClient()));
        Professor professor = professorRepository.findById(dto.getIdProfessor())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Professor not found with id: " + dto.getIdProfessor()));

        payment.setClient(client);
        payment.setProfessor(professor);
        payment.setDate(dto.getDate());
        payment.setPaymentType(PaymentType.PRODUCTS);

        List<PaymentProduct> productsPayment = dto.getProducts().stream().map(productDetailRequestDTO -> {
            Product product = productRepository.findById(productDetailRequestDTO.getIdProduct())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + productDetailRequestDTO.getIdProduct()));

            if (product.getStock() < productDetailRequestDTO.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getProductName());
            }

            // Decrease stock
            product.setStock(product.getStock() - productDetailRequestDTO.getQuantity());
            productRepository.save(product);

            PaymentProduct paymentProduct = new PaymentProduct();
            paymentProduct.setProduct(product);
            paymentProduct.setQuantity(productDetailRequestDTO.getQuantity());
            paymentProduct.setClient(client);
            paymentProduct.setPayment(payment);
            paymentProduct.setUnitPrice(product.getPrice());

            return paymentProduct;
        }).toList();

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
