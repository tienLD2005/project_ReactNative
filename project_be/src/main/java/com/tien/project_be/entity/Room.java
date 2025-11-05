package com.tien.project_be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    // Many rooms -> 1 hotel
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    private String roomType;

    @Column(nullable = false)
    private Double price = 0.00;

    @Column(name = "max_adults", nullable = false)
    private Integer maxAdults = 1;

    @Column(name = "max_children", nullable = false)
    private Integer maxChildren = 0;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_available", nullable = false)
    private boolean available = true;

    // 1 Room - N RoomImages
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomImage> images;

    // 1 Room - N Bookings
    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY)
    private List<Booking> bookings;

    // 1 Room - N Reviews
    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY)
    private List<Review> reviews;
}
