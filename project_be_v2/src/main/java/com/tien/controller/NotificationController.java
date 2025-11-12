package com.tien.controller;

import com.tien.dto.response.APIResponse;
import com.tien.dto.response.NotificationResponseDTO;
import com.tien.service.NotificationService;
import com.tien.service.UserService;
import com.tien.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")
public class NotificationController {
    
    private final NotificationService notificationService;
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<APIResponse<List<NotificationResponseDTO>>> getUserNotifications() {
        try {
            User user = userService.getCurrentUser();
            List<NotificationResponseDTO> notifications = notificationService.getUserNotifications(user.getUserId());
            return ResponseEntity.ok(APIResponse.success(notifications, "Lấy danh sách thông báo thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/unread")
    public ResponseEntity<APIResponse<List<NotificationResponseDTO>>> getUnreadNotifications() {
        try {
            User user = userService.getCurrentUser();
            List<NotificationResponseDTO> notifications = notificationService.getUnreadNotifications(user.getUserId());
            return ResponseEntity.ok(APIResponse.success(notifications, "Lấy danh sách thông báo chưa đọc thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<APIResponse<Long>> getUnreadCount() {
        try {
            User user = userService.getCurrentUser();
            Long count = notificationService.getUnreadCount(user.getUserId());
            return ResponseEntity.ok(APIResponse.success(count, "Lấy số lượng thông báo chưa đọc thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<APIResponse<NotificationResponseDTO>> markAsRead(@PathVariable Long notificationId) {
        try {
            User user = userService.getCurrentUser();
            NotificationResponseDTO notification = notificationService.markAsRead(notificationId, user.getUserId());
            return ResponseEntity.ok(APIResponse.success(notification, "Đánh dấu đã đọc thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<APIResponse<Void>> markAllAsRead() {
        try {
            User user = userService.getCurrentUser();
            notificationService.markAllAsRead(user.getUserId());
            return ResponseEntity.ok(APIResponse.success(null, "Đánh dấu tất cả đã đọc thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<APIResponse<Void>> deleteNotification(@PathVariable Long notificationId) {
        try {
            User user = userService.getCurrentUser();
            notificationService.deleteNotification(notificationId, user.getUserId());
            return ResponseEntity.ok(APIResponse.success(null, "Xóa thông báo thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @DeleteMapping
    public ResponseEntity<APIResponse<Void>> deleteAllNotifications() {
        try {
            User user = userService.getCurrentUser();
            notificationService.deleteAllNotifications(user.getUserId());
            return ResponseEntity.ok(APIResponse.success(null, "Xóa tất cả thông báo thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
}

