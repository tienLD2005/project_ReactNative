package com.tien.project_be.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private LoginData data;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LoginData {
        private Long id;
        private String name;
        private String email;
        private String token;
    }

    public LoginResponse(Long id, String name, String email, String token, String message) {
        this.success = true;
        this.message = message;
        this.data = new LoginData(id, name, email, token);
    }
}