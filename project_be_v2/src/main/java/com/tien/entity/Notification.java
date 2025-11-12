package com.tien.entity;

import com.tien.utils.NotificationStatus;
import com.tien.utils.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    // User nhận thông báo
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Kiểu thông báo (thành công, hủy, hệ thống, ...)
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private NotificationType type;

    // Gắn với booking
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Bookings booking;

    // Tiêu đề ngắn của thông báo
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    // Nội dung chi tiết
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    // Trạng thái đã đọc / chưa đọc
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.UNREAD;

    // Thời gian tạo thông báo
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

