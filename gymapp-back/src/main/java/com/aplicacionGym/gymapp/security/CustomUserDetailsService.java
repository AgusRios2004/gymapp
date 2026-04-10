package com.aplicacionGym.gymapp.security;

import com.aplicacionGym.gymapp.entity.Person;
import com.aplicacionGym.gymapp.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import com.aplicacionGym.gymapp.entity.Administrator;
import com.aplicacionGym.gymapp.entity.Professor;
import org.springframework.security.core.GrantedAuthority;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private PersonRepository personRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Person person = personRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        List<GrantedAuthority> authorities = new ArrayList<>();
        if (person instanceof Administrator) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        } else if (person instanceof Professor) {
            authorities.add(new SimpleGrantedAuthority("ROLE_PROFESSOR"));
        }

        return new User(person.getEmail(), person.getPassword(), authorities);
    }
}
