package com.aplicacionGym.gymapp.modules.core.security;

import lombok.RequiredArgsConstructor;
import com.aplicacionGym.gymapp.modules.core.entity.Administrator;
import com.aplicacionGym.gymapp.modules.core.entity.Person;
import com.aplicacionGym.gymapp.modules.core.entity.Professor;
import com.aplicacionGym.gymapp.modules.core.repository.PersonRepository;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.GrantedAuthority;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final PersonRepository personRepository;

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
