package com.example.BackEnd.service;

import com.example.BackEnd.dto.LoginRequest;
import com.example.BackEnd.dto.SignupRequest;
import com.example.BackEnd.dto.UpdateProfileRequest;
import com.example.BackEnd.dto.UserProfileResponse;

public interface UserService {
    UserProfileResponse signup(SignupRequest request);

    String login(LoginRequest request);

    UserProfileResponse getProfile(String email);

    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
}