package com.example.BackEnd.service.impl;

import com.example.BackEnd.dto.LoginRequest;
import com.example.BackEnd.dto.SignupRequest;
import com.example.BackEnd.dto.UpdateProfileRequest;
import com.example.BackEnd.dto.UserProfileResponse;
import com.example.BackEnd.entity.Users;
import com.example.BackEnd.repository.UsersRepository;
import com.example.BackEnd.security.JwtTokenProvider;
import com.example.BackEnd.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public UserProfileResponse signup(SignupRequest request) {
        // Check if username already exists
        if (usersRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists");
        }

        // Check if email already exists
        if (usersRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create new user
        Users user = new Users();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setAvatarUrl(request.avatarUrl() != null ? request.avatarUrl() : "/avatars/default.png");

        Users savedUser = usersRepository.save(user);

        return new UserProfileResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getAvatarUrl());
    }

    @Override
    public String login(LoginRequest request) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        // Generate JWT token
        return jwtTokenProvider.generateToken(authentication);
    }

    @Override
    public UserProfileResponse getProfile(String email) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getAvatarUrl());
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Update username if provided
        if (request.username() != null && !request.username().equals(user.getUsername())) {
            if (usersRepository.existsByUsername(request.username())) {
                throw new IllegalArgumentException("Username already exists");
            }
            user.setUsername(request.username());
        }

        // Update password if provided
        if (request.password() != null) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        // Update avatar if provided
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }

        Users updatedUser = usersRepository.save(user);

        return new UserProfileResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getAvatarUrl());
    }
}