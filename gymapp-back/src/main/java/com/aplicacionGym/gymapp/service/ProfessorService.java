package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.repository.ProfessorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProfessorService {

    @Autowired
    private ProfessorRepository professorRepository;

    public Professor createProfesor(Professor professor){
        return professorRepository.save(professor);
    }

    public Optional<Professor> getProfessorById(Long id){
        return professorRepository.findById(id);
    }

    public List<Professor> getAllProfessor(){
        return professorRepository.findAll();
    }

    public List<Professor> getActiveProfessor(){
        return professorRepository.findByActiveTrue();
    }

    public List<Professor> getInactiveProfessor(){
        return professorRepository.findByActiveFalse();
    }

    public Optional<Professor> updateProfessor(Long id, Professor updatedProfessor){
        return professorRepository.findById(id)
                .map(professor -> {
                    professor.setName(updatedProfessor.getName());
                    professor.setLastName(updatedProfessor.getLastName());
                    professor.setDni(updatedProfessor.getDni());
                    professor.setPhone(updatedProfessor.getPhone());
                    professor.setActive(updatedProfessor.isActive());
                    professor.setEmail(updatedProfessor.getEmail());
                    professor.setPassword(updatedProfessor.getPassword());
                    return professorRepository.save(professor);
                });
    }

    public void deleteProfessor(Long id){
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Professor not found with id: "+id));
        professor.setActive(false);
        professorRepository.save(professor);

    }

}
