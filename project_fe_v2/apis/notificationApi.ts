import axiosInstance from '@/utils/axiosInstance';

export type NotificationType = 'BOOKING_SUCCESS' | 'BOOKING_CANCELLED' | 'SYSTEM' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED';
export type NotificationStatus = 'UNREAD' | 'READ';

export interface NotificationResponse {
  notificationId: number;
  type: NotificationType;
  bookingId?: number;
  title: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
  roomName?: string;
  hotelName?: string;
  checkIn?: string;
  checkOut?: string;
}

// Lấy tất cả thông báo của user
export const getNotifications = async (): Promise<NotificationResponse[]> => {
  const response = await axiosInstance.get('notifications');
  return response.data.data;
};

// Lấy thông báo chưa đọc
export const getUnreadNotifications = async (): Promise<NotificationResponse[]> => {
  const response = await axiosInstance.get('notifications/unread');
  return response.data.data;
};

// Đếm số thông báo chưa đọc
export const getUnreadCount = async (): Promise<number> => {
  const response = await axiosInstance.get('notifications/unread/count');
  return response.data.data;
};

// Đánh dấu thông báo là đã đọc
export const markAsRead = async (notificationId: number): Promise<NotificationResponse> => {
  const response = await axiosInstance.put(`notifications/${notificationId}/read`);
  return response.data.data;
};

// Đánh dấu tất cả thông báo là đã đọc
export const markAllAsRead = async (): Promise<void> => {
  await axiosInstance.put('notifications/read-all');
};

// Xóa thông báo
export const deleteNotification = async (notificationId: number): Promise<void> => {
  await axiosInstance.delete(`notifications/${notificationId}`);
};

// Xóa tất cả thông báo
export const deleteAllNotifications = async (): Promise<void> => {
  await axiosInstance.delete('notifications');
};

