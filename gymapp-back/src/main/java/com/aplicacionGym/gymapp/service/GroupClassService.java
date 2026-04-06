package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.repository.GroupClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class GroupClassService {

    @Autowired
    private GroupClassRepository groupClassRepository;

    public List<GroupClass> getAllClasses() {
        return groupClassRepository.findAll();
    }

    public GroupClass createClass(GroupClass groupClass) {
        Objects.requireNonNull(groupClass, "GroupClass cannot be null");
        return groupClassRepository.save(groupClass);
    }

    public void deleteClass(Long id) {
        Objects.requireNonNull(id, "ID cannot be null");
        groupClassRepository.deleteById(id);
    }
}
