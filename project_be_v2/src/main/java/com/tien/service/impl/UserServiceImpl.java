package com.tien.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tien.dto.request.UpdateProfileRequest;
import com.tien.dto.request.UserLogin;
import com.tien.dto.request.UserRegister;
import com.tien.dto.response.JWTResponse;
import com.tien.entity.Otp;
import com.tien.entity.User;
import com.tien.repository.OtpRepository;
import com.tien.repository.UserRepository;
import com.tien.security.jwt.JWTProvider;
import com.tien.security.pricipal.CustomUserDetails;
import com.tien.service.OtpService;
import com.tien.service.UserService;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JWTProvider jwtProvider;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private OtpService otpService;
    @Autowired
    private OtpRepository otpRepository;

    @Override
    @Transactional
    public User registerUser(UserRegister userRegister) {
        if (userRepository.existsByEmail(userRegister.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        if (userRepository.existsByPhoneNumber(userRegister.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }
        
        // Tạo password tạm thời (sẽ được thay đổi sau khi verify OTP và set password)
        String tempPassword = "TEMP_PASSWORD_" + System.currentTimeMillis();
        
        User user = User.builder()
                .fullName(userRegister.getFullName())
                .passwordHash(passwordEncoder.encode(tempPassword))
                .email(userRegister.getEmail())
                .phoneNumber(userRegister.getPhoneNumber())
                .dateOfBirth(userRegister.getDateOfBirth())
                .gender(userRegister.getGender())
                .avatar("https://aic.com.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-1.jpg") // Avatar mặc định
                .enabled(false) // Chưa được kích hoạt cho đến khi verify OTP và set password
                .build();
        userRepository.save(user);
        
        // Tạo và gửi OTP
        otpService.createOtp(user);
        
        log.info("User registered: {}, waiting for OTP verification", user.getEmail());
        return user;
    }

    @Override
    @Transactional
    public void setPassword(String phoneNumber, String password) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Otp otp = otpRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã OTP. Vui lòng xác thực OTP trước."));

        if (!otp.isVerified()) {
            throw new RuntimeException("Vui lòng xác thực OTP trước khi đặt mật khẩu");
        }

        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEnabled(true);
        userRepository.save(user);

        // Xóa OTP theo user thay vì xóa instance đang managed
        otpRepository.deleteByUser(user);

        log.info("Password set successfully for user: {}", phoneNumber);
    }


    @Override
    public JWTResponse login(UserLogin userLogin) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userLogin.getEmail(), userLogin.getPassword()));
        } catch (AuthenticationException e) {
            log.error("Sai email hoặc password!");
            throw new RuntimeException("Đăng nhập thất bại!");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return JWTResponse.builder()
                .fullName(userDetails.getFullName())
                .email(userDetails.getEmail())
                .build();
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || authentication.getPrincipal() == null) {
            log.error("Authentication is null or principal is null");
            throw new RuntimeException("Không có thông tin xác thực. Vui lòng đăng nhập lại.");
        }
        
        Object principal = authentication.getPrincipal();

        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
            log.debug("Getting user by email from UserDetails: {}", email);
        } else {
            email = principal.toString();
            log.debug("Getting user by email from principal string: {}", email);
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new RuntimeException("Không tìm thấy user với email: " + email);
                });

    }

    @Override
    @Transactional
    public User updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        // Chỉ cập nhật các trường được cung cấp (không null)
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            // Kiểm tra số điện thoại đã tồn tại chưa (trừ chính user hiện tại)
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber()) 
                    && !request.getPhoneNumber().equals(user.getPhoneNumber())) {
                throw new RuntimeException("Số điện thoại đã được sử dụng");
            }
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null && !request.getGender().trim().isEmpty()) {
            user.setGender(request.getGender());
        }
        if (request.getAvatar() != null && !request.getAvatar().trim().isEmpty()) {
            user.setAvatar(request.getAvatar());
        }

        userRepository.save(user);
        log.info("Profile updated for user: {}", user.getEmail());
        return user;
    }
}
