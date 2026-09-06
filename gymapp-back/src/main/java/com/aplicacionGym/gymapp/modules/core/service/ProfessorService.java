package com.aplicacionGym.gymapp.modules.core.service;

import lombok.RequiredArgsConstructor;
import com.aplicacionGym.gymapp.modules.core.entity.Professor;
import com.aplicacionGym.gymapp.modules.core.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.modules.core.repository.ProfessorRepository;

import com.aplicacionGym.gymapp.modules.core.mapper.ProfessorMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
@RequiredArgsConstructor
public class ProfessorService {

    private final ProfessorRepository professorRepository;

    private final ProfessorMapper professorMapper;

    private final PasswordEncoder passwordEncoder;

    public Professor createProfesor(Professor professor) {
        if (professor.getPassword() != null) {
            professor.setPassword(passwordEncoder.encode(professor.getPassword()));
        }
        professor.setActive(true);
        return professorRepository.save(professor);
    }

    public Optional<Professor> getProfessorById(Long id) {
        return professorRepository.findById(id);
    }

    public List<Professor> getAllProfessor() {
        return professorRepository.findAll();
    }

    public List<Professor> getActiveProfessor() {
        return professorRepository.findByActiveTrue();
    }

    public List<Professor> getInactiveProfessor() {
        return professorRepository.findByActiveFalse();
    }

    public Optional<Professor> updateProfessor(Long id, Professor updatedProfessor) {
        return professorRepository.findById(id)
                .map(professor -> {
                    professorMapper.updateEntityFromDto(updatedProfessor, professor);
                    if (updatedProfessor.getPassword() != null && !updatedProfessor.getPassword().isEmpty()) {
                        professor.setPassword(passwordEncoder.encode(updatedProfessor.getPassword()));
                    }
                    return professorRepository.save(professor);
                });
    }

    public void deleteProfessor(Long id) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Professor not found with id: " + id));
        professor.setActive(!professor.isActive());
        professorRepository.save(professor);

    }

}
