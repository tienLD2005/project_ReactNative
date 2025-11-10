package com.tien.mapper;

import com.tien.dto.response.BookingResponseDTO;
import com.tien.entity.Bookings;
import com.tien.entity.Room;

import java.util.List;
import java.util.stream.Collectors;

public class BookingMapper {
    
    public static BookingResponseDTO toDTO(Bookings booking) {
        if (booking == null) {
            return null;
        }
        
        Room room = booking.getRoom();
        String roomImageUrl = null;
        if (room != null && room.getImages() != null && !room.getImages().isEmpty()) {
            roomImageUrl = room.getImages().get(0).getImageUrl();
        }
        
        // Rating and review count will be calculated in service layer
        // Set default values here, will be overridden by service
        return BookingResponseDTO.builder()
            .bookingId(booking.getBookingId())
            .roomId(room != null ? room.getRoomId() : null)
            .roomType(room != null ? room.getRoomType() : null)
            .roomImageUrl(roomImageUrl)
            .hotelId(room != null && room.getHotel() != null ? room.getHotel().getHotelId() : null)
            .hotelName(room != null && room.getHotel() != null ? room.getHotel().getHotelName() : null)
            .hotelLocation(room != null && room.getHotel() != null ? 
                (room.getHotel().getCity() != null ? room.getHotel().getCity() : "") + 
                (room.getHotel().getCountry() != null ? ", " + room.getHotel().getCountry() : "") : null)
            .hotelCity(room != null && room.getHotel() != null ? room.getHotel().getCity() : null)
            .hotelAddress(room != null && room.getHotel() != null ? room.getHotel().getAddress() : null)
            .checkIn(booking.getCheckIn())
            .checkOut(booking.getCheckOut())
            .totalPrice(booking.getTotalPrice())
            .status(booking.getStatus())
            .adultsCount(booking.getAdultsCount())
            .childrenCount(booking.getChildrenCount())
            .infantsCount(booking.getInfantsCount())
            .createdAt(booking.getCreatedAt())
            .rating(0.0) // Will be calculated in service layer
            .reviewCount(0) // Will be calculated in service layer
            .build();
    }
    
    public static List<BookingResponseDTO> toDTOList(List<Bookings> bookings) {
        if (bookings == null) {
            return List.of();
        }
        return bookings.stream()
            .map(BookingMapper::toDTO)
            .collect(Collectors.toList());
    }
}

