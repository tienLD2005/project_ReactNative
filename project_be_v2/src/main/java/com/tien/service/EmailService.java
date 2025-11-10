package com.tien.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    /**
     * Gửi mã OTP đến email của người dùng
     * 
     * @param to      Email đích nhận OTP (email của người dùng đăng ký)
     * @param otpCode Mã OTP cần gửi
     * @throws MessagingException Nếu có lỗi khi gửi email
     * 
     *                            Lưu ý: Email trong application.properties
     *                            (spring.mail.username) chỉ là email SENDER
     *                            để xác thực với SMTP server. Email nhận OTP là
     *                            tham số 'to' (email của người dùng).
     */
    public void sendOtpEmail(String to, String otpCode) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to); // Email đích nhận là email của người dùng đăng ký
        helper.setSubject("Mã xác thực OTP của bạn");
        helper.setText("Xin chào,\n\nMã OTP của bạn là: " + otpCode + "\nMã này sẽ hết hạn sau 5 phút.");
        mailSender.send(message);
    }
}