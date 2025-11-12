package com.tien.dto.response;

import com.tien.utils.NotificationStatus;
import com.tien.utils.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDTO {
    private Long notificationId;
    private NotificationType type;
    private Integer bookingId;
    private String title;
    private String message;
    private NotificationStatus status;
    private LocalDateTime createdAt;
    
    // Booking info (optional)
    private String roomName;
    private String hotelName;
    private String checkIn;
    private String checkOut;
}

