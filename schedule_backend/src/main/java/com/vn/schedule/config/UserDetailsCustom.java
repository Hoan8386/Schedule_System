package com.vn.schedule.config;

import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.vn.schedule.domain.User;
import com.vn.schedule.repository.UserRepository;

@Component("userDetailsService")
public class UserDetailsCustom implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsCustom(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy người dùng với username/email: " + username));

        boolean enabled = "ACTIVE".equalsIgnoreCase(user.getStatus());
        return org.springframework.security.core.userdetails.User.withUsername(
                user.getUsername())
                .password(user.getPasswordHash())
                .disabled(!enabled)
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                .build();
    }

}