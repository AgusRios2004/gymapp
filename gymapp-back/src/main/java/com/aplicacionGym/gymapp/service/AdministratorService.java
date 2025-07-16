package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.config.SecurityConfig;
import com.aplicacionGym.gymapp.dto.request.AdministratorRequestDTO;
import com.aplicacionGym.gymapp.dto.response.AdministratorResponseDTO;
import com.aplicacionGym.gymapp.entity.Administrator;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.mapper.AdministratorMapper;
import com.aplicacionGym.gymapp.repository.AdministratorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdministratorService {

    @Autowired
    private AdministratorRepository administratorRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public AdministratorResponseDTO createAdministrator(AdministratorRequestDTO dto) {
        Administrator administrator = AdministratorMapper.toEntity(dto);
        administrator.setPassword(passwordEncoder.encode(dto.getPassword()));
        Administrator saved = administratorRepository.save(administrator);
        return AdministratorMapper.toDTO(saved);
    }

    public AdministratorResponseDTO getAdministratorById(Long id){
        return administratorRepository.findById(id)
                .map(AdministratorMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator not found with id: "+id));
    }

    public List<AdministratorResponseDTO> getAllAdministrator(){
        return administratorRepository.findAll()
                .stream()
                .map(AdministratorMapper::toDTO)
                .toList();
    }

    public AdministratorResponseDTO updateAdministrator(Long id, AdministratorRequestDTO dto) {
        Administrator administrator = administratorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator not found with id: " + id));

        administrator.setName(dto.getName());
        administrator.setLastName(dto.getLastName());
        administrator.setPhone(dto.getPhone());
        administrator.setDni(dto.getDni());
        administrator.setEmail(dto.getEmail());
        administrator.setPassword(passwordEncoder.encode(dto.getPassword()));

        Administrator updated = administratorRepository.save(administrator);
        return AdministratorMapper.toDTO(updated);
    }

    public void deleteAdministrator(Long id){
        Administrator administrator = administratorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator not found with id: "+id));
        administratorRepository.delete(administrator);
    }


}
