package com.aplicacionGym.gymapp.controller;

import com.aplicacionGym.gymapp.dto.response.WebApiResponse;
import com.aplicacionGym.gymapp.dto.response.WebApiResponseBuilder;
import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.service.GroupClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.aplicacionGym.gymapp.dto.response.ClientResponseDTO;
import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class GroupClassController {

    @Autowired
    private GroupClassService groupClassService;

    @GetMapping
    public ResponseEntity<WebApiResponse> getAllClasses() {
        List<GroupClass> classes = groupClassService.getAllClasses();
        return ResponseEntity.ok(WebApiResponseBuilder.success("Classes fetched successfully", classes));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<WebApiResponse> getStudentsByClass(@PathVariable Long id) {
        List<ClientResponseDTO> students = groupClassService.getStudentsByClass(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Students fetched successfully", students));
    }

    @PostMapping
    public ResponseEntity<WebApiResponse> createClass(@RequestBody GroupClass groupClass) {
        GroupClass created = groupClassService.createClass(groupClass);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Class created successfully", created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WebApiResponse> deleteClass(@PathVariable Long id) {
        groupClassService.deleteClass(id);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Class deleted successfully", null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebApiResponse> updateClass(@PathVariable Long id, @RequestBody GroupClass groupClass) {
        GroupClass updated = groupClassService.updateClass(id, groupClass);
        return ResponseEntity.ok(WebApiResponseBuilder.success("Class updated successfully", updated));
    }
}
