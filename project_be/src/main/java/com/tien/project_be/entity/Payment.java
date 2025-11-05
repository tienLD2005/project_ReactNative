package com.tien.project_be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One-to-one booking
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    private String cardNumber;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus = "pending";

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;
}
