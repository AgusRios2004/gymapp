package com.aplicacionGym.gymapp.security;

import com.aplicacionGym.gymapp.entity.Administrator;
import com.aplicacionGym.gymapp.repository.AdministratorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private AdministratorRepository administratorRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Administrator admin = administratorRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Administrator not found with email: " + email));

        return new User(admin.getEmail(), admin.getPassword(), new ArrayList<>());
    }
}
