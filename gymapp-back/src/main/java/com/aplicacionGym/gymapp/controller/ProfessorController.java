package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.entity.Professor;
import com.aplicacionGym.gymapp.exception.ResourceNotFoundException;
import com.aplicacionGym.gymapp.service.ProfessorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professors")
public class ProfessorController {

    @Autowired
    private ProfessorService professorService;

    @GetMapping
    private ResponseEntity<WebApiResponse> getAllProfessors(@RequestParam(required = false) Boolean active){
        List<Professor> professors;

        if(active == null){
            professors = professorService.getAllProfessor();
        }else if(active){
            professors = professorService.getActiveProfessor();
        }else{
            professors = professorService.getInactiveProfessor();
        }

        return ResponseEntity.ok(WebApiResponseBuilder.success("Professors founds successfully", professors));
    }

    @GetMapping("/{id}")
    private ResponseEntity<WebApiResponse> getProfessorById(@PathVariable Long id){
        Professor professor = professorService.getProfessorById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Professor not found with id: "+id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Professor found successfully", professor));
    }

    @PostMapping
    private ResponseEntity<WebApiResponse> createProfessor(@RequestBody Professor professor){
        Professor professorCreated = professorService.createProfesor(professor);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Professor created succesfully", professorCreated));
    }

    @PutMapping("/{id}")
    private ResponseEntity<WebApiResponse> updateProfessor(@PathVariable Long id, @RequestBody Professor updatedProfessor){
        Professor professor = professorService.updateProfessor(id, updatedProfessor)
                .orElseThrow(() -> new ResourceNotFoundException("Professor not found with id: "+id));
        return ResponseEntity.ok(WebApiResponseBuilder.success("Professor updated successfully", professor));
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<WebApiResponse> deleteProfessor(@PathVariable Long id){
        professorService.deleteProfessor(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Professor successfully terminated", null));
    }

}
