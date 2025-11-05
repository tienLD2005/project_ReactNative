package com.tien.project_be.controller;

import com.tien.project_be.dto.request.*;
import com.tien.project_be.dto.response.ApiResponse;
import com.tien.project_be.dto.response.LoginResponse;
import com.tien.project_be.dto.response.RegisterResponse;
import com.tien.project_be.service.AuthService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest req) {
        return new ResponseEntity<>(authService.register(req), HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return new ResponseEntity<>(authService.login(req), HttpStatus.OK);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Object>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String msg = authService.forgotPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, msg));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Object>> verifyOtp(@RequestBody VerifyOtpRequest request) {
        String msg = authService.verifyOtp(request);
        return ResponseEntity.ok(new ApiResponse<>(true, msg));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(@RequestBody ResetPasswordRequest request) {
        String msg = authService.resetPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, msg));
    }
}