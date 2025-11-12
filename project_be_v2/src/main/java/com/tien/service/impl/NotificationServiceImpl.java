package com.tien.service.impl;

import com.tien.dto.response.NotificationResponseDTO;
import com.tien.entity.Bookings;
import com.tien.entity.Notification;
import com.tien.entity.User;
import com.tien.exception.NotFoundException;
import com.tien.repository.NotificationRepository;
import com.tien.service.NotificationService;
import com.tien.utils.NotificationStatus;
import com.tien.utils.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    
    private final NotificationRepository notificationRepository;
    
    @Override
    @Transactional
    public NotificationResponseDTO createNotification(User user, NotificationType type, Bookings booking, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .booking(booking)
                .title(title)
                .message(message)
                .status(NotificationStatus.UNREAD)
                .build();
        
        notification = notificationRepository.save(notification);
        return toDTO(notification);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getUserNotifications(Integer userId) {
        List<Notification> notifications = notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getUnreadNotifications(Integer userId) {
        List<Notification> notifications = notificationRepository.findByUser_UserIdAndStatusOrderByCreatedAtDesc(
                userId, NotificationStatus.UNREAD);
        return notifications.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public NotificationResponseDTO markAsRead(Long notificationId, Integer userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông báo với ID: " + notificationId));
        
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền truy cập thông báo này");
        }
        
        notification.setStatus(NotificationStatus.READ);
        notification = notificationRepository.save(notification);
        return toDTO(notification);
    }
    
    @Override
    @Transactional
    public void markAllAsRead(Integer userId) {
        notificationRepository.markAllAsRead(userId, NotificationStatus.READ, NotificationStatus.UNREAD);
    }
    
    @Override
    @Transactional
    public void deleteNotification(Long notificationId, Integer userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông báo với ID: " + notificationId));
        
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa thông báo này");
        }
        
        notificationRepository.delete(notification);
    }
    
    @Override
    @Transactional
    public void deleteAllNotifications(Integer userId) {
        notificationRepository.deleteByUser_UserId(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(Integer userId) {
        return notificationRepository.countByUser_UserIdAndStatus(userId, NotificationStatus.UNREAD);
    }
    
    private NotificationResponseDTO toDTO(Notification notification) {
        NotificationResponseDTO.NotificationResponseDTOBuilder builder = NotificationResponseDTO.builder()
                .notificationId(notification.getNotificationId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .status(notification.getStatus())
                .createdAt(notification.getCreatedAt());
        
        if (notification.getBooking() != null) {
            Bookings booking = notification.getBooking();
            builder.bookingId(booking.getBookingId());
            
            // Get room and hotel info from booking
            if (booking.getRoom() != null) {
                builder.roomName(booking.getRoom().getRoomType());
                if (booking.getRoom().getHotel() != null) {
                    builder.hotelName(booking.getRoom().getHotel().getHotelName());
                }
            }
            
            if (booking.getCheckIn() != null) {
                builder.checkIn(booking.getCheckIn().format(DateTimeFormatter.ISO_LOCAL_DATE));
            }
            if (booking.getCheckOut() != null) {
                builder.checkOut(booking.getCheckOut().format(DateTimeFormatter.ISO_LOCAL_DATE));
            }
        }
        
        return builder.build();
    }
}

