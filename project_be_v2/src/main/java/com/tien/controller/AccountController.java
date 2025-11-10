package com.tien.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tien.dto.request.RefreshTokenRequest;
import com.tien.dto.request.ResendOtpRequest;
import com.tien.dto.request.SetPasswordRequest;
import com.tien.dto.request.UserLogin;
import com.tien.dto.request.UserRegister;
import com.tien.dto.request.VerifyOtpRequest;
import com.tien.dto.response.APIResponse;
import com.tien.dto.response.JWTResponse;
import com.tien.dto.response.UserResponseDTO;
import com.tien.entity.User;
import com.tien.mapper.UserMapper;
import com.tien.repository.UserRepository;
import com.tien.security.jwt.JWTProvider;
import com.tien.service.OtpService;
import com.tien.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:8081")

public class AccountController {
    private final UserService userService;
    private final OtpService otpService;
    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final JWTProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final HttpServletRequest request;

    @PostMapping("/register")
    public ResponseEntity<APIResponse<UserResponseDTO>> registerUser(@Valid @RequestBody UserRegister userRegister) {
        try {
            User user = userService.registerUser(userRegister);
            UserResponseDTO dto = UserMapper.toDTO(user);
            return ResponseEntity
                    .ok(APIResponse.success(dto, "Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP."));
        } catch (RuntimeException e) {
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.status(400)
                    .body(APIResponse.error(e.getMessage(), null));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<APIResponse<Map<String, String>>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        boolean isValid = otpService.verifyOtp(request.getOtp(), request.getPhoneNumber());
        if (!isValid) {
            return ResponseEntity.status(400)
                    .body(APIResponse.error("Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.", null));
        }
        return ResponseEntity.ok(APIResponse.success(
                Map.of("message", "Xác thực OTP thành công. Vui lòng đặt mật khẩu."),
                "Xác thực OTP thành công"));
    }

    @PostMapping("/complete-registration")
    public ResponseEntity<APIResponse<Map<String, String>>> completeRegistration(
            @Valid @RequestBody SetPasswordRequest request) {
        try {
            userService.setPassword(request.getPhoneNumber(), request.getPassword());
            return ResponseEntity.ok(APIResponse.success(
                    Map.of("message", "Đăng ký hoàn tất thành công. Bạn có thể đăng nhập ngay."),
                    "Đăng ký hoàn tất thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(APIResponse.error(e.getMessage(), null));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<APIResponse<Map<String, String>>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        try {
            otpService.resendOtp(request.getPhoneNumber());
            return ResponseEntity.ok(APIResponse.success(
                    Map.of("message", "Mã OTP mới đã được gửi đến email của bạn."),
                    "Gửi lại OTP thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(APIResponse.error(e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLogin userLogin, HttpServletRequest request) {
        log.info("Login request: email={}, password={}", userLogin.getEmail(), userLogin.getPassword());
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(userLogin.getEmail(), userLogin.getPassword()));

        User user = userRepository.findByEmail(userLogin.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        if (!user.isEnabled()) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Tài khoản chưa được kích hoạt. Vui lòng hoàn tất đăng ký."));
        }

        String authorities = auth.getAuthorities() == null ? ""
                : String.join(
                        ",",
                        auth.getAuthorities().stream().map(a -> a.getAuthority()).toList());

        String accessToken = jwtProvider.generateToken(user.getEmail(), authorities);
        String refreshToken = jwtProvider.generateRefreshToken(user.getEmail(), authorities);

        JWTResponse response = new JWTResponse(
                user,
                accessToken,
                refreshToken,
                authorities);

        return ResponseEntity.ok(response);

    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest body) {
        String refreshToken = body.getRefreshToken();
        if (refreshToken == null || !jwtProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of("message", "Refresh token không hợp lệ"));
        }
        String email = jwtProvider.getUsernameFromToken(refreshToken);
        String newAccessToken = jwtProvider.generateToken(email, "");
        return ResponseEntity.ok(Map.of("token", newAccessToken));
    }
}
