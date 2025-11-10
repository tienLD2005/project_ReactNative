package com.tien.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tien.entity.Bookings;
import com.tien.utils.BookingStatus;

public interface BookingRepository extends JpaRepository<Bookings, Integer> {

    List<Bookings> findByUser_UserId(Integer userId);

    List<Bookings> findByUser_UserIdAndStatus(Integer userId, BookingStatus status);

    @Query("SELECT b FROM Bookings b WHERE b.user.userId = :userId AND b.checkOut >= :today")
    List<Bookings> findUpcomingBookings(@Param("userId") Integer userId, @Param("today") LocalDate today);

    @Query("SELECT b FROM Bookings b WHERE b.user.userId = :userId AND b.checkOut < :today")
    List<Bookings> findPastBookings(@Param("userId") Integer userId, @Param("today") LocalDate today);

    @Query("SELECT b FROM Bookings b WHERE b.user.userId = :userId AND b.checkOut < :today AND b.status = :status")
    List<Bookings> findPastBookingsByStatus(@Param("userId") Integer userId, @Param("today") LocalDate today,
            @Param("status") BookingStatus status);

    Bookings findByBookingId(Integer bookingId);
}
