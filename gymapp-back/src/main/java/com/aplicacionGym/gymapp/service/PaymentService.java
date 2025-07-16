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

    public PaymentResponseDTO createMonthlyPayment(MonthlyPaymentRequestDTO dto){
        Payment payment = new Payment();
        Client client = clientRepository.findById(dto.getIdClient())
                        .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: "+dto.getIdClient()));
        Professor professor = professorRepository.findById(dto.getIdProfessor())
                        .orElseThrow(() -> new ResourceNotFoundException("Professor not found with id: "+dto.getIdProfessor()));
        MonthlyType monthlyType = monthlyTypeRepository.findById(dto.getIdMonthlyType())
                        .orElseThrow(() -> new ResourceNotFoundException("Monthly Type not found with id: "+dto.getIdMonthlyType()));
        payment.setDate(dto.getDate());
        payment.setPaymentType(PaymentType.MONTHLY);
        payment.setMonthlyType(monthlyType);
        payment.setAmount(monthlyType.getPrice());
        payment.setClient(client);
        payment.setProfessor(professor);

        paymentRepository.save(payment);

        return PaymentMapper.toDTO(payment);
    }

    public PaymentResponseDTO createProductPayment(ProductPaymentRequestDTO dto){
        Payment payment = new Payment();
        Client client = clientRepository.findById(dto.getIdClient())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: "+dto.getIdClient()));
        Professor professor = professorRepository.findById(dto.getIdProfessor())
                .orElseThrow(() -> new ResourceNotFoundException("Professor not found with id: "+dto.getIdProfessor()));

        payment.setClient(client);
        payment.setProfessor(professor);
        payment.setDate(dto.getDate());
        payment.setPaymentType(PaymentType.PRODUCTS);

        List<PaymentProduct> productsPayment = dto.getProducts().stream().map(productDetailRequestDTO -> {
            PaymentProduct paymentProduct = new PaymentProduct();
            Product product = productRepository.findById(productDetailRequestDTO.getIdProduct())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " +productDetailRequestDTO.getIdProduct()));

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

    public List<PaymentResponseDTO> getPaymentsByProfessor(Long id){
        List<Payment> payments = paymentRepository.findByProfessorId(id);
        return payments.stream()
                .map(PaymentMapper::toDTO)
                .toList();
    }

    public List<PaymentResponseDTO> getPaymentsByClient(Long id){
        List<Payment> payments = paymentRepository.findByClientId(id);
        return payments.stream()
                .map(PaymentMapper::toDTO)
                .toList();
    }

    public List<PaymentResponseDTO> getAllPayments(){
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream()
                .map(PaymentMapper::toDTO)
                .toList();
    }

}
