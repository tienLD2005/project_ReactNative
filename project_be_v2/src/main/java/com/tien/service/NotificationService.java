package com.tien.service;

import com.tien.dto.response.NotificationResponseDTO;
import com.tien.entity.Bookings;
import com.tien.entity.User;
import com.tien.utils.NotificationType;

import java.util.List;

public interface NotificationService {
    
    // Tạo thông báo mới
    NotificationResponseDTO createNotification(User user, NotificationType type, Bookings booking, String title, String message);
    
    // Lấy tất cả thông báo của user hiện tại
    List<NotificationResponseDTO> getUserNotifications(Integer userId);
    
    // Lấy thông báo chưa đọc
    List<NotificationResponseDTO> getUnreadNotifications(Integer userId);
    
    // Đánh dấu thông báo là đã đọc
    NotificationResponseDTO markAsRead(Long notificationId, Integer userId);
    
    // Đánh dấu tất cả thông báo là đã đọc
    void markAllAsRead(Integer userId);
    
    // Xóa thông báo
    void deleteNotification(Long notificationId, Integer userId);
    
    // Xóa tất cả thông báo
    void deleteAllNotifications(Integer userId);
    
    // Đếm số thông báo chưa đọc
    Long getUnreadCount(Integer userId);
}

