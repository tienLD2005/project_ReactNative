package com.tien.project_be.service;

import com.tien.project_be.dto.request.*;
import com.tien.project_be.dto.response.LoginResponse;
import com.tien.project_be.dto.response.RegisterResponse;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);

    String forgotPassword(ForgotPasswordRequest request);
    String verifyOtp(VerifyOtpRequest request);
    String resetPassword(ResetPasswordRequest request);
}
