package com.tien.project_be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(name = "num_adults", nullable = false)
    private Integer numAdults = 1;

    @Column(name = "num_children", nullable = false)
    private Integer numChildren = 0;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice = 0.00;

    @Column(name = "booking_status", nullable = false)
    private String bookingStatus = "pending";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // 1 Booking ↔ 1 Payment
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Payment payment;

    // 1 Booking ↔ 1 Review (optional)
    @OneToOne(mappedBy = "booking", fetch = FetchType.LAZY)
    private Review review;
}
