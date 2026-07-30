package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.repository.ProfessorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class ProfessorService {

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
                    professor.setName(updatedProfessor.getName());
                    professor.setLastName(updatedProfessor.getLastName());
                    professor.setDni(updatedProfessor.getDni());
                    professor.setPhone(updatedProfessor.getPhone());
                    professor.setActive(updatedProfessor.isActive());
                    professor.setEmail(updatedProfessor.getEmail());
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
