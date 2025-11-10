package com.tien.service.impl;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tien.entity.Otp;
import com.tien.entity.User;
import com.tien.repository.OtpRepository;
import com.tien.repository.UserRepository;
import com.tien.service.EmailService;
import com.tien.service.OtpService;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int OTP_LENGTH = 4; // Tạo 4 chữ số OTP
    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    public String generateOtpCode() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    @Override
    @Transactional
    public Otp createOtp(User user) {
        // Xóa OTP cũ nếu có
        Optional<Otp> existingOtp = otpRepository.findByUser(user);
        if (existingOtp.isPresent()) {
            otpRepository.delete(existingOtp.get());
        }

        // Tạo OTP mới
        String otpCode = generateOtpCode();
        Otp otp = Otp.builder()
                .otpCode(otpCode)
                .user(user)
                .expiredAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .verified(false)
                .build();

        Otp savedOtp = otpRepository.save(otp);

        // Gửi OTP qua email đến email của người dùng đăng ký
        // Email nhận OTP là user.getEmail(), không phải email trong
        // application.properties
        sendOtpEmail(user.getEmail(), otpCode);

        log.info("OTP created and sent to user email: {}", user.getEmail());
        return savedOtp;
    }

    @Override
    @Transactional
    public boolean verifyOtp(String otpCode, String phoneNumber) {
        Optional<User> userOpt = userRepository.findByPhoneNumber(phoneNumber);
        if (userOpt.isEmpty()) {
            log.warn("User not found with phone number: {}", phoneNumber);
            return false;
        }

        User user = userOpt.get();
        Optional<Otp> otpOpt = otpRepository.findByOtpCodeAndUser(otpCode, user);

        if (otpOpt.isEmpty()) {
            log.warn("Invalid OTP code: {} for user: {}", otpCode, phoneNumber);
            return false;
        }

        Otp otp = otpOpt.get();

        // Kiểm tra OTP đã được verify chưa
        if (otp.isVerified()) {
            log.warn("OTP already verified for user: {}", phoneNumber);
            return false;
        }

        // Kiểm tra OTP hết hạn
        if (otp.getExpiredAt().isBefore(LocalDateTime.now())) {
            log.warn("OTP expired for user: {}", phoneNumber);
            otpRepository.delete(otp);
            return false;
        }

        // Đánh dấu OTP đã được verify
        otp.setVerified(true);
        otpRepository.save(otp);

        log.info("OTP verified successfully for user: {}", phoneNumber);
        return true;
    }

    @Override
    public void sendOtpSms(String phoneNumber, String otpCode) {
        // Method này giữ lại để tương thích với interface, nhưng không sử dụng
        // OTP sẽ được gửi qua email thay vì SMS
    }

    @Override
    @Transactional
    public void resendOtp(String phoneNumber) {
        Optional<User> userOpt = userRepository.findByPhoneNumber(phoneNumber);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy người dùng với số điện thoại: " + phoneNumber);
        }

        User user = userOpt.get();
        createOtp(user);
        log.info("OTP resent to email: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void deleteOtp(User user) {
        otpRepository.deleteByUser(user);
    }

    private void sendOtpEmail(String email, String otpCode) {
        try {
            emailService.sendOtpEmail(email, otpCode);
            log.info("OTP email sent successfully to: {}", email);
        } catch (MessagingException e) {
            log.error("Error sending OTP email to {}: {}", email, e.getMessage());
            throw new RuntimeException("Không thể gửi email OTP", e);
        }
    }
}
