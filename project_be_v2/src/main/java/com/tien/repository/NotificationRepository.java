package com.tien.repository;

import com.tien.entity.Notification;
import com.tien.utils.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Lấy tất cả thông báo của user, sắp xếp theo thời gian mới nhất
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
    
    // Lấy thông báo chưa đọc của user
    List<Notification> findByUser_UserIdAndStatusOrderByCreatedAtDesc(Integer userId, NotificationStatus status);
    
    // Đếm số thông báo chưa đọc
    Long countByUser_UserIdAndStatus(Integer userId, NotificationStatus status);
    
    // Đánh dấu tất cả thông báo của user là đã đọc
    @Modifying
    @Query("UPDATE Notification n SET n.status = :status WHERE n.user.userId = :userId AND n.status = :oldStatus")
    int markAllAsRead(@Param("userId") Integer userId, 
                      @Param("status") NotificationStatus status,
                      @Param("oldStatus") NotificationStatus oldStatus);
    
    // Xóa tất cả thông báo của user
    void deleteByUser_UserId(Integer userId);
}

