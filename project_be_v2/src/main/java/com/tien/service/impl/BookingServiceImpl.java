package com.tien.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tien.dto.request.BookingRequest;
import com.tien.dto.response.BookingResponseDTO;
import com.tien.entity.Bookings;
import com.tien.entity.Room;
import com.tien.entity.User;
import com.tien.entity.Review;
import com.tien.exception.NotFoundException;
import com.tien.mapper.BookingMapper;
import com.tien.repository.BookingRepository;
import com.tien.repository.RoomRepository;
import com.tien.repository.ReviewRepository;
import com.tien.service.BookingService;
import com.tien.service.NotificationService;
import com.tien.service.UserService;
import com.tien.utils.BookingStatus;
import com.tien.utils.NotificationType;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    
    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequest request) {
        User user = userService.getCurrentUser();
        Room room = roomRepository.findById(request.getRoomId())
            .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng với ID: " + request.getRoomId()));
        
        // Calculate number of nights
        long nights = java.time.temporal.ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (nights <= 0) {
            throw new RuntimeException("Số đêm phải lớn hơn 0");
        }
        
        // Calculate total price: room price * number of guests * number of nights
        int totalGuests = (request.getAdultsCount() != null ? request.getAdultsCount() : 0) + 
                         (request.getChildrenCount() != null ? request.getChildrenCount() : 0);
        double totalPrice = room.getPrice() * totalGuests * nights;
        
        Bookings booking = Bookings.builder()
            .user(user)
            .room(room)
            .checkIn(request.getCheckIn())
            .checkOut(request.getCheckOut())
            .totalPrice(totalPrice)
            .status(BookingStatus.PENDING)
            .adultsCount(request.getAdultsCount())
            .childrenCount(request.getChildrenCount())
            .infantsCount(request.getInfantsCount())
            .build();
        
        booking = bookingRepository.save(booking);
        
        // Tạo thông báo khi booking thành công
        String title = "Booking Confirmed! 🎉";
        String message = String.format(
            "Your booking has been confirmed successfully. Check-in: %s, Check-out: %s",
            booking.getCheckIn(),
            booking.getCheckOut()
        );
        notificationService.createNotification(
            user,
            NotificationType.BOOKING_SUCCESS,
            booking,
            title,
            message
        );
        
        return toDTOWithRating(booking);
    }
    
    // Helper method to calculate rating and review count for a room
    private void calculateRoomRating(Integer roomId, BookingResponseDTO dto) {
        if (roomId == null) {
            dto.setRating(0.0);
            dto.setReviewCount(0);
            return;
        }
        
        List<Review> reviews = reviewRepository.findByRoom_RoomId(roomId);
        if (reviews == null || reviews.isEmpty()) {
            dto.setRating(0.0);
            dto.setReviewCount(0);
            return;
        }
        
        int reviewCount = reviews.size();
        double rating = reviews.stream()
            .mapToInt(Review::getRating)
            .average()
            .orElse(0.0);
        
        dto.setRating(rating);
        dto.setReviewCount(reviewCount);
    }
    
    // Convert booking to DTO with rating calculation
    private BookingResponseDTO toDTOWithRating(Bookings booking) {
        BookingResponseDTO dto = BookingMapper.toDTO(booking);
        if (dto != null && dto.getRoomId() != null) {
            calculateRoomRating(dto.getRoomId(), dto);
        }
        return dto;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getUpcomingBookings(Integer userId) {
        LocalDate today = LocalDate.now();
        List<Bookings> bookings = bookingRepository.findUpcomingBookings(userId, today);
        List<BookingResponseDTO> dtos = BookingMapper.toDTOList(bookings);
        // Calculate ratings for all bookings
        dtos.forEach(dto -> {
            if (dto != null && dto.getRoomId() != null) {
                calculateRoomRating(dto.getRoomId(), dto);
            }
        });
        return dtos;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getPastBookings(Integer userId) {
        LocalDate today = LocalDate.now();
        List<Bookings> bookings = bookingRepository.findPastBookings(userId, today);
        List<BookingResponseDTO> dtos = BookingMapper.toDTOList(bookings);
        // Calculate ratings for all bookings
        dtos.forEach(dto -> {
            if (dto != null && dto.getRoomId() != null) {
                calculateRoomRating(dto.getRoomId(), dto);
            }
        });
        return dtos;
    }
    
    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Integer bookingId) {
        Bookings booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + bookingId));
        return toDTOWithRating(booking);
    }
    
    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Integer bookingId) {
        Bookings booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + bookingId));
        
        User currentUser = userService.getCurrentUser();
        if (!booking.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Bạn không có quyền hủy booking này");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);
        
        // Tạo thông báo khi hủy booking
        String title = "Booking Cancelled";
        String message = "Your booking has been cancelled. Refund will be processed according to the cancellation policy.";
        notificationService.createNotification(
            currentUser,
            NotificationType.BOOKING_CANCELLED,
            booking,
            title,
            message
        );
        
        return toDTOWithRating(booking);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getUserBookings(Integer userId) {
        List<Bookings> bookings = bookingRepository.findByUser_UserId(userId);
        List<BookingResponseDTO> dtos = BookingMapper.toDTOList(bookings);
        // Calculate ratings for all bookings
        dtos.forEach(dto -> {
            if (dto != null && dto.getRoomId() != null) {
                calculateRoomRating(dto.getRoomId(), dto);
            }
        });
        return dtos;
    }
}

