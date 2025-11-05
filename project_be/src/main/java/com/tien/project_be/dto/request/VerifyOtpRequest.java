package com.tien.project_be.dto.request;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String email;
    private String otp;
    private String purpose; // REGISTER or RESET_PASSWORD
}