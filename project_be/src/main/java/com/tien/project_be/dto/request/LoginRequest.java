package com.tien.project_be.dto.request;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
