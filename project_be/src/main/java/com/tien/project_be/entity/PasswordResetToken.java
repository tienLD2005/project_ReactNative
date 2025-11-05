package com.tien.project_be.entity;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;


@Entity
@Table(name = "password_reset_tokens")
@Data
public class PasswordResetToken {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false)
    private String email;


    @Column(nullable = false)
    private String otp;


    @Column(nullable = false)
    private LocalDateTime expiredAt;

    private String purpose;
}