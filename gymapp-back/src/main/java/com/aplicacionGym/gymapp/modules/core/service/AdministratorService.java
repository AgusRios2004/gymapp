package com.aplicacionGym.gymapp.modules.core.service;

import lombok.RequiredArgsConstructor;
import com.aplicacionGym.gymapp.modules.core.dto.request.AdministratorRequestDTO;
import com.aplicacionGym.gymapp.modules.core.dto.response.AdministratorResponseDTO;
import com.aplicacionGym.gymapp.modules.core.entity.Administrator;
import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.modules.core.mapper.AdministratorMapper;
import com.aplicacionGym.gymapp.modules.core.repository.AdministratorRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
@RequiredArgsConstructor
public class AdministratorService {

    private final AdministratorRepository administratorRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdministratorMapper administratorMapper;

    public AdministratorResponseDTO createAdministrator(AdministratorRequestDTO dto) {
        Administrator administrator = administratorMapper.toEntity(dto);
        administrator.setPassword(passwordEncoder.encode(dto.getPassword()));
        Administrator saved = administratorRepository.save(administrator);
        return administratorMapper.toDTO(saved);
    }

    public AdministratorResponseDTO getAdministratorById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return administratorRepository.findById(id)
                .map(administratorMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator not found with id: " + id));
    }

    public List<AdministratorResponseDTO> getAllAdministrator() {
        return administratorRepository.findAll()
                .stream()
                .map(administratorMapper::toDTO)
                .toList();
    }

    public AdministratorResponseDTO updateAdministrator(Long id, AdministratorRequestDTO dto) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        Administrator administrator = administratorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator not found with id: " + id));

        administrator.setName(dto.getName());
        administrator.setLastName(dto.getLastName());
        administrator.setPhone(dto.getPhone());
        administrator.setDni(dto.getDni());
        administrator.setEmail(dto.getEmail());
        administrator.setPassword(passwordEncoder.encode(dto.getPassword()));

        Administrator updated = administratorRepository.save(administrator);
        return administratorMapper.toDTO(updated);
    }

    public void deleteAdministrator(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        Administrator administrator = administratorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator not found with id: " + id));
        administratorRepository.delete(administrator);
    }

}
