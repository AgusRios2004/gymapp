package com.aplicacionGym.gymapp.service;

import com.aplicacionGym.gymapp.entity.GroupClass;
import com.aplicacionGym.gymapp.repository.GroupClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupClassService {

    @Autowired
    private GroupClassRepository groupClassRepository;

    public List<GroupClass> getAllClasses() {
        return groupClassRepository.findAll();
    }

    public GroupClass createClass(GroupClass groupClass) {
        return groupClassRepository.save(groupClass);
    }

    public void deleteClass(Long id) {
        groupClassRepository.deleteById(id);
    }
}
