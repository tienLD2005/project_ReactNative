package com.tien.project_be.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tien.project_be.dto.request.ForgotPasswordRequest;
import com.tien.project_be.dto.request.LoginRequest;
import com.tien.project_be.dto.request.RegisterRequest;
import com.tien.project_be.dto.request.ResetPasswordRequest;
import com.tien.project_be.dto.request.VerifyOtpRequest;
import com.tien.project_be.dto.response.LoginResponse;
import com.tien.project_be.dto.response.RegisterResponse;
import com.tien.project_be.entity.PasswordResetToken;
import com.tien.project_be.entity.User;
import com.tien.project_be.exception.AccountNotVerifiedException;
import com.tien.project_be.exception.EmailNotFoundException;
import com.tien.project_be.exception.InvalidOtpException;
import com.tien.project_be.exception.OtpExpiredException;
import com.tien.project_be.exception.OtpNotFoundException;
import com.tien.project_be.exception.ValidationException;
import com.tien.project_be.repository.PasswordResetTokenRepository;
import com.tien.project_be.repository.UserRepository;
import com.tien.project_be.service.AuthService;
import com.tien.project_be.service.EmailService;
import com.tien.project_be.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    @Override
    public RegisterResponse register(RegisterRequest request) {
        // Collect validation errors
        Map<String, String> validationErrors = new HashMap<>();

        // Check email trùng
        if (userRepository.existsByEmail(request.getEmail())) {
            validationErrors.put("email", "Email đã tồn tại trong hệ thống");
        }

        // Check số điện thoại trùng
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            validationErrors.put("phoneNumber", "Số điện thoại đã tồn tại trong hệ thống");
        }

        // Validate và parse date of birth
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        LocalDate dateOfBirth = null;
        try {
            dateOfBirth = LocalDate.parse(request.getDateOfBirth(), formatter);

            // Validate tuổi (phải trên 13 tuổi)
            LocalDate minDate = LocalDate.now().minusYears(18);
            if (dateOfBirth.isAfter(minDate)) {
                validationErrors.put("dateOfBirth", "Bạn phải trên 18 tuổi");
            }

            // Validate không quá 120 tuổi
            LocalDate maxDate = LocalDate.now().minusYears(100);
            if (dateOfBirth.isBefore(maxDate)) {
                validationErrors.put("dateOfBirth", "Ngày sinh không hợp lệ");
            }
        } catch (Exception e) {
            validationErrors.put("dateOfBirth", "Ngày sinh không hợp lệ. Vui lòng nhập đúng định dạng dd-MM-yyyy");
        }

        // Nếu có lỗi validation, throw exception với field errors
        if (!validationErrors.isEmpty()) {
            throw new ValidationException(validationErrors);
        }

        // Tạo user nếu không có lỗi (dateOfBirth đã được validate)
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setGender(request.getGender());
        user.setDateOfBirth(dateOfBirth);

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setVerified(false);
        user.setAvatar(null);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(null);

        userRepository.save(user);

        String otp = String.format("%06d", new Random().nextInt(1_000_000));

        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(request.getEmail());
        token.setOtp(otp);
        token.setPurpose("REGISTER");
        token.setExpiredAt(LocalDateTime.now().plusMinutes(10));
        tokenRepository.save(token);

        // Gửi email bất đồng bộ (không block response)
        sendEmailAsync(request.getEmail(), otp);

        return new RegisterResponse(
                user,
                "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản");
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Map<String, String> validationErrors = new HashMap<>();

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            validationErrors.put("email", "Email không tồn tại trong hệ thống");
        } else {
            if (!user.isVerified()) {
                throw new AccountNotVerifiedException(
                        "Tài khoản chưa được xác minh. Vui lòng kiểm tra email để xác thực");
            }

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                validationErrors.put("password", "Mật khẩu không chính xác");
            }
        }

        // Nếu có lỗi validation (email không tồn tại hoặc password sai), throw
        // exception với field errors
        if (!validationErrors.isEmpty()) {
            throw new ValidationException(validationErrors);
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                token,
                "Đăng nhập thành công");
    }

    @Override
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EmailNotFoundException("Email không tồn tại trong hệ thống"));

        String otp = String.format("%06d", new Random().nextInt(1_000_000));
        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setOtp(otp);
        token.setPurpose("RESET_PASSWORD");
        token.setExpiredAt(LocalDateTime.now().plusMinutes(10));
        tokenRepository.save(token);

        // Gửi email bất đồng bộ
        sendResetPasswordEmailAsync(email, otp);

        return "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư";
    }

    @Override
    @Transactional
    public String verifyOtp(VerifyOtpRequest request) {
        PasswordResetToken token = tokenRepository
                .findTopByEmailAndPurposeOrderByIdDesc(request.getEmail(), request.getPurpose())
                .orElseThrow(() -> new OtpNotFoundException("Không tìm thấy mã OTP. Vui lòng thử lại"));

        if (token.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new OtpExpiredException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới");
        }

        if (!token.getOtp().equals(request.getOtp())) {
            throw new InvalidOtpException("Mã OTP không chính xác. Vui lòng kiểm tra lại");
        }

        if ("REGISTER".equals(request.getPurpose())) {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new EmailNotFoundException("Email không tồn tại trong hệ thống"));

            user.setVerified(true);
            userRepository.save(user);
            tokenRepository.deleteByEmailAndPurpose(request.getEmail(), "REGISTER");
            return "Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ";
        }

        return "Xác thực OTP thành công";
    }

    @Override
    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = tokenRepository
                .findTopByEmailAndPurposeOrderByIdDesc(request.getEmail(), "RESET_PASSWORD")
                .orElseThrow(() -> new OtpNotFoundException("Không tìm thấy mã OTP. Vui lòng thử lại"));

        if (token.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new OtpExpiredException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới");
        }

        if (!token.getOtp().equals(request.getOtp())) {
            throw new InvalidOtpException("Mã OTP không chính xác. Vui lòng kiểm tra lại");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EmailNotFoundException("Email không tồn tại trong hệ thống"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenRepository.deleteByEmailAndPurpose(request.getEmail(), "RESET_PASSWORD");

        return "Đổi mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới";
    }

    @Async
    protected void sendEmailAsync(String email, String otp) {
        try {
            emailService.sendSimpleMessage(
                    email,
                    "Xác minh tài khoản",
                    "Mã OTP của bạn là: " + otp);
        } catch (Exception e) {
            // Log error nhưng không throw để không ảnh hưởng đến response
            System.err.println("Failed to send email to " + email + ": " + e.getMessage());
        }
    }

    @Async
    protected void sendResetPasswordEmailAsync(String email, String otp) {
        try {
            emailService.sendSimpleMessage(
                    email,
                    "Mã OTP đặt lại mật khẩu",
                    "OTP của bạn là: " + otp);
        } catch (Exception e) {
            System.err.println("Failed to send reset password email to " + email + ": " + e.getMessage());
        }
    }
}