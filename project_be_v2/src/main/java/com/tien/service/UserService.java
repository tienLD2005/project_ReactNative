package com.tien.service;

import com.tien.dto.request.UpdateProfileRequest;
import com.tien.dto.request.UserLogin;
import com.tien.dto.request.UserRegister;
import com.tien.dto.response.JWTResponse;
import com.tien.entity.User;

public interface UserService {
    User registerUser(UserRegister userRegister);
    void setPassword(String phoneNumber, String password);
    JWTResponse login(UserLogin userLogin);
    public User getCurrentUser();
    User updateProfile(UpdateProfileRequest request);
}
